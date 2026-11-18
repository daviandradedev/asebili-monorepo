import { accountInitials } from "../lib/account-profile";

type ProfileAvatarProps = {
  name: string;
  email: string;
  image?: string | null;
};

export function ProfileAvatar({ name, email, image }: ProfileAvatarProps) {
  return (
    <span className="user-avatar" aria-hidden="true">
      {image ? (
        <span className="user-avatar-image" style={{ backgroundImage: `url(${JSON.stringify(image)})` }} />
      ) : (
        accountInitials(name, email)
      )}
    </span>
  );
}
