import { Navigation } from "../component/navigation";

const FullLayout = ({ children }) => {
  return (
    <div>
      <Navigation />
      {children}
    </div>
  );
};

export default FullLayout;
