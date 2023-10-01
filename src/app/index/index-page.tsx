import { Scheduler } from '@components/scheduler';
import { makeStyles, Text } from '@rneui/themed';
import { Link } from 'expo-router';
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

export const IndexPage = (props: any) => {
  const styles = useStyles(props);

  return (
    <ScrollView
      style={{
        borderStyle: 'solid',
        borderColor: 'red',
        borderWidth: 1,
      }}
    >
      <Text>Index page</Text>
      <Link href="/history"> go to history</Link>
      <Scheduler />
    </ScrollView>
  );
};
