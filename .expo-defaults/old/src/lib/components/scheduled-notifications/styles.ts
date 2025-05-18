import { makeStyles } from '@rneui/themed';
import { globalStyles, spacingValues } from '@theme';

export const useStyles = makeStyles((theme, props: any) => ({
  cardContainer: {
    flexDirection: 'row',
    paddingVertical: spacingValues.standard,
  },
  timeContainer: {
    width: '35%',
    ...globalStyles.justifyCenter,
  },
  descriptionContainer: {
    width: '65%',
    ...globalStyles.justifyCenter,
    paddingHorizontal: 20,
  },
  timeText: {
    ...globalStyles.bigText,
  },
  dateText: {
    ...globalStyles.smallText,
    textAlign: 'center',
  },
}));
