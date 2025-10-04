<<<<<<< HEAD
module.exports = function(api) {
=======
module.exports = function (api) {
>>>>>>> db7d4e8a830a523f770e7a1923d69cef533efd16
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
<<<<<<< HEAD
      'react-native-worklets/plugin',
=======
      'react-native-reanimated/plugin',
>>>>>>> db7d4e8a830a523f770e7a1923d69cef533efd16
    ],
  };
};