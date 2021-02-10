export class ProfilePayload {
  profile: {
    id: number;
    height: number | null;
    name: string | null;
  };
  id: string;
  email: string;
}
