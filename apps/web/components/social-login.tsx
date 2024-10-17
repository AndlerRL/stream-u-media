import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';

const SocialLogin: React.FC = () => {
  const supabase = useSupabaseClient();

  return (
    <Auth
      supabaseClient={supabase}
      appearance={{ theme: ThemeSupa }}
      providers={['google', 'facebook', 'twitter']}
    />
  );
};

export default SocialLogin;

// const shareFacebook = (url: string, quote: string) => {
//   FB.ui({
//     method: 'share',
//     href: url,
//     quote: quote,
//   }, function (response) { });
// };