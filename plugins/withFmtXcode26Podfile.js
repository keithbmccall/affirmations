/**
 * Injects fmt pod C++17 workaround into ios/Podfile after expo prebuild.
 * Fixes Xcode 26+ Apple Clang: "call to consteval function ... basic_format_string ... is not a constant expression"
 * in Pods/fmt (React Native bundles fmt 11.x).
 */
const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const MARKER = '# __fmt_xcode26_podfile_workaround__';

const WORKAROUND_BLOCK =
  /\n\s*(?:#\s*__fmt_xcode26_podfile_workaround__|#\s*\{MARKER\})\s*\n\s*# Xcode 26\+.*?CLANG_CXX_LANGUAGE_STANDARD.*?c\+\+17'\s*\n\s*end\s*\n\s*end\s*\n\s*end/g;

function buildSnippet() {
  return `

    ${MARKER}
    # Xcode 26+ / Apple Clang: fmt 11.x FMT_STRING consteval fails (React Native third-party pod).
    installer.pods_project.targets.each do |target|
      if target.name == 'fmt'
        target.build_configurations.each do |build_config|
          build_config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
        end
      end
    end`;
}

/** @type {Array<{ name: string; pattern: RegExp; replace: (snippet: string) => string }>} */
const FOOTER_ANCHORS = [
  // Expo SDK 54+: post_install closes right after react_native_post_install(...)
  {
    name: 'sdk54-post-install',
    pattern: /(\n    \)\n)(  end\nend\s*)$/,
    replace: (snippet) => `$1${snippet}\n$2`,
  },
  // Expo SDK 53 and earlier: resource bundle signing nest, then post_install / target end
  {
    name: 'sdk53-resource-bundle',
    pattern: /(\n      end\n    end)(\n  end\nend\s*)$/,
    replace: (snippet) => `$1${snippet}$2`,
  },
];

function withFmtXcode26Podfile(config) {
  return withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const podfilePath = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(podfilePath, 'utf8');

      contents = contents.replace(WORKAROUND_BLOCK, '');

      if (contents.includes(MARKER)) {
        fs.writeFileSync(podfilePath, contents);
        return cfg;
      }

      const snippet = buildSnippet();
      let updated = null;

      for (const anchor of FOOTER_ANCHORS) {
        if (anchor.pattern.test(contents)) {
          updated = contents.replace(anchor.pattern, anchor.replace(snippet));
          break;
        }
      }

      if (updated === null) {
        throw new Error(
          'withFmtXcode26Podfile: Podfile footer anchor not found; update plugins/withFmtXcode26Podfile.js for your Expo template.',
        );
      }

      fs.writeFileSync(podfilePath, updated);
      return cfg;
    },
  ]);
}

module.exports = withFmtXcode26Podfile;
