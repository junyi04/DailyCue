import { StyleSheet, Text, View } from "react-native";

const Header = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Folders</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 70,
    paddingBottom: 20,
    paddingHorizontal: 30,
  },
  text: {
    fontSize: 30,
    fontWeight: 'bold',
  }
})

export default Header;