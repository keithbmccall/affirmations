interface ValidatorCallbacks {
  onTitleError: (message: string) => void;
  onMessageError: (message: string) => void;
  onTimeError: (message: string) => void;
}
type SchedulerValidator = (input: {
  title: string;
  message: string;
  time: Date;
  callbacks: ValidatorCallbacks;
}) => boolean;
export const schedulerValidator: SchedulerValidator = ({
  title,
  message,
  time,
  callbacks: { onTitleError, onMessageError, onTimeError },
}) => {
  const timeNow = Date.now();
  const timeOfSchedule = time.getTime();
  let isError = false;
  if (title.length < 3) {
    isError = true;
    onTitleError('Titles need to be at least 3 characters!');
  }
  if (message.length < 8) {
    isError = true;
    onMessageError('Messages need to be at least 8 characters!');
  }

  if (timeNow > timeOfSchedule) {
    isError = true;
    onTimeError('Messages cannot be scheduled in the past!');
  }

  return !isError;
};
