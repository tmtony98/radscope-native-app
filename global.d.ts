declare global {
  var HermesInternal: boolean | undefined;
}

declare module '@expo-google-fonts/poppins' {
  import { FontSource } from 'expo-font';
  
  export const Poppins_400Regular: FontSource;
  export const Poppins_500Medium: FontSource; 
  export const Poppins_600SemiBold: FontSource;
  export const Poppins_700Bold: FontSource;
}

declare module 'react-native-manage-external-storage' {
  export interface ManageExternalStorageInterface {
    checkAndGrantPermission: () => Promise<boolean>;
    hasPermission: () => Promise<boolean>;
    requestPermission: () => void;
  }

  const ManageExternalStorage: ManageExternalStorageInterface;
  export default ManageExternalStorage;
}

declare global {
  interface NativeModulesStatic {
    PermissionFile: {
      checkAndGrantPermission: () => Promise<boolean>;
    };
  }
}