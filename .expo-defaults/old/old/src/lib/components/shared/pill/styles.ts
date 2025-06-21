import { makeStyles } from '@rneui/themed';
import { globalStyles, spacingValues } from '@theme';

export const useStyles = makeStyles((theme, props: any) => ({
  option: {
    padding: spacingValues.standard,
    ...globalStyles.mildText,
  },
  optionContainer: {
    width: '50%',
    ...globalStyles.justifyCenter,
  },
  selectedOptionContainer: {
    borderStyle: 'solid',
    borderColor: theme.colors.grey5,
    backgroundColor: theme.colors.grey5,
  },
}));
