import { MessageForm } from '@components/forms';
import { makeStyles } from '@rneui/themed';
import { ScrollView } from 'react-native';

const useStyles = makeStyles((theme, props: any) => ({
  container: {
    background: theme.colors.white,
    width: '100%',
  },
  text: {
    color: theme.colors.primary,
  },
}));

export default function IndexPage(props: any) {
  const styles = useStyles(props);

  return (
    <ScrollView>
      <MessageForm />
    </ScrollView>
  );
}
