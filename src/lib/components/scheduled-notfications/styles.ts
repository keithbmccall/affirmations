import { makeStyles } from '@rneui/themed';
import { globalStyles } from '@theme';

export const useStyles = makeStyles((theme, props: any) => ({
  notificationCategoryOption: {
    width: '50%',
    ...globalStyles.justifyCenter,
  },
  selectedNotificationCategoryOption: {
    borderStyle: 'solid',
    borderColor: theme.colors.grey5,
    backgroundColor: theme.colors.grey5,
  },
  cardContainer: {
    flexDirection: 'row',
    paddingVertical: 10,
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
