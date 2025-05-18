import { makeStyles } from '@rneui/themed';
import { globalStyles, spacingValues } from '@theme';
import { ElementStyle } from '../../theme/types';

export const getPlaceholderStyle = (value: string, extraStyle?: ElementStyle) =>
  value ? extraStyle : { ...globalStyles.mildText, ...extraStyle };

export const useStyles = makeStyles((theme, props: any) => ({
  errorStyle: {
    fontSize: 10,
    color: theme.colors.error,
  },
  dateTimePickerContainer: {
    ...globalStyles.relative,
  },
  dateTimePickerErrorStyle: {
    ...globalStyles.absolute,
    paddingHorizontal: 37,
    bottom: spacingValues.standard,
  },
  inputContainer: {
    width: '100%',
    backgroundColor: theme.colors.grey5,
    ...globalStyles.br10,
    paddingTop: 15,
    paddingHorizontal: 20,
  },
  messageInput: { height: 120 },
  submit: {
    width: '100%',
    ...globalStyles.br10,
    marginTop: spacingValues.standard,
  },
}));
