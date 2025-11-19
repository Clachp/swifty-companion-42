import { User42 } from './api.types';

export type RootStackParamList = {
  Login: undefined;
  Search: undefined;
  Profile: { user: User42 };
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}