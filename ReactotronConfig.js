import Reactotron ,{networking}from "reactotron-react-native";

Reactotron.configure() // controls connection & communication settings
  .use(networking())
  .connect(); // let's connect!
