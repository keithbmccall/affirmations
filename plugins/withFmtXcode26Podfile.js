/**
 * Injects fmt pod C++17 workaround into ios/Podfile after expo prebuild.
 * Fixes Xcode 26+ Apple Clang: "call to consteval function ... basic_format_string ... is not a constant expression"
 * in Pods/fmt (React Native bundles fmt 11.x).
 */
const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

const MARKER = '# __fmt_xcode26_podfile_workaround__';

const SNIPPET = `

    #{MARKER}
    # Xcode 26+ / Apple Clang: fmt 11.x FMT_STRING consteval fails (React Native third-party pod).
    installer.pods_project.targets.each do |target|
      if target.name == 'fmt'
        target.build_configurations.each do |build_config|
          build_config.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
        end
      end
    end`;

function withFmtXcode26Podfile(config) {
  return withDangerousMod(config, [
    'ios',
    async (cfg) => {
      const podfilePath = path.join(cfg.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(podfilePath, 'utf8');
      if (contents.includes(MARKER)) {
        return cfg;
      }
      // Expo template: resource bundle signing block, then post_install / target `end`.
      const anchor = `      end
    end
  end
end`;
      if (!contents.includes(anchor)) {
        throw new Error(
          'withFmtXcode26Podfile: Podfile footer anchor not found; update plugins/withFmtXcode26Podfile.js for your Expo template.',
        );
      }
      contents = contents.replace(
        anchor,
        `      end
    end${SNIPPET}
  end
end`,
      );
      fs.writeFileSync(podfilePath, contents);
      return cfg;
    },
  ]);
}

module.exports = withFmtXcode26Podfile;
