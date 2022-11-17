import Camera from '../classes/Camera';
import Group from '../classes/Group';
import User from '../classes/User';

function getMockUser(): User {
  const mockUser = new User('username', '74637463-3843jife', []);
  mockUser.groupList.push(new Group('groupname1', '3648234', []));
  mockUser.groupList.push(new Group('groupname2', '3434', []));
  mockUser.groupList.push(new Group('groupname3', '232124', []));
  return mockUser;
}

describe(User, () => {
  let user: User;
  beforeEach(() => {
    user = getMockUser();
  });

  describe('getGroupFromId()', () => {
    it('will get the group if the group id exists in the list', () => {
      console.log(user.getGroupFromId(user.groupList[2].groupId));
      expect(user.getGroupFromId(user.groupList[2].groupId)).toEqual(user.groupList[2]);
    });
    it('will throw an error if the group id does not exist in the group list', () => {
      expect(() => {
        user.getGroupFromId('NOTAVVALIDID');
      }).toThrowError();
    });
  });
  describe('removeGroupFromList()', () => {
    it('will successfully remove the group from the groupArr array on success', () => {
      const result = user.groupList[1];
      expect(user.removeGroupFromList(1)).toBe(result);
      expect(user.groupList).toHaveLength(2);
    });
    it('will throw error and not remove group from the groupArr on fail (out of bounds)', () => {
      expect(() => {
        user.removeGroupFromList(3);
      }).toThrowError();
      expect(user.groupList).toHaveLength(3);
    });
    it('will throw an error when you group has cameras', () => {
      user.groupList.push(
        new Group('groupwithcameras', '88888', [new Camera('test', '78346378', [])])
      );
      expect(() => {
        console.log(user.removeGroupFromList(3));
      }).toThrowError();
      expect(user.groupList).toHaveLength(4);
    });
  });
});
