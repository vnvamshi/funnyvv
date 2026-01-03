import useWindowSize from '../../hooks/useWindowSize';
import MobileSignup from './MobileSignup';
import WebSignup from './WebSignup';

const Signup = () => {
  const { width } = useWindowSize();
  const isMobile = width <= 1024;

  return isMobile ? <MobileSignup /> : <WebSignup onClose={() => {}} onSwitchToLogin={() => {}} onSwitchToAgentSignUp={() => {}} />;
};

export default Signup; 