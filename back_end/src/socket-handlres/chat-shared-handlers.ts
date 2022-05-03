import { UserData } from '../app_types';

export function mapUsersDataMapToArray(usersData: Map<string, UserData>): UserData[] {
  const usersDataArr: UserData[] = [];
  for (let item of usersData.values()) {
    usersDataArr.push(item);
  }
  return usersDataArr;
}
