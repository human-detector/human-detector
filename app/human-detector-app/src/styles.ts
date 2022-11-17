import { StyleSheet } from 'react-native';

/**
 * This file is so we can export a style sheet in any screen that
 * or component that we need these styles in.  Reformatting!!!!!!
 */

// eslint-disable-next-line import/prefer-default-export
export const styles = StyleSheet.create({
  menuItemSettingsButton: {
    alignSelf: 'flex-end',
    alignItems: 'center',
  },
  centerIcon: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  regContainer: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-end',
    padding: 20,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#777',
    padding: 8,
  },
  menuItem: {
    marginTop: 24,
    marginLeft: 20,
    marginRight: 20,
    padding: 30,
    backgroundColor: '#E0FFFF',
    fontSize: 24,
    borderWidth: 2,
    borderColor: '#D3D3D3',
  },
  addButtonItem: {
    borderColor: '#D3D3D3',
    backgroundColor: '#DCDCDC',
  },
  menuButtonText: {
    fontSize: 24,
    marginTop: 10,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    alignItems: 'center',
    fontSize: 50,
    marginTop: 0,
    marginBottom: 0,
  },
  input: {
    height: 40,
    marginBottom: 10,
    borderWidth: 1,
    padding: 10,
  },
  button: {
    marginTop: 20,
  },
});
