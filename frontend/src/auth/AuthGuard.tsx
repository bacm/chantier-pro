interface Props {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: Props) => {
  return <>{children}</>;
};
