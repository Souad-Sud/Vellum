import CategoriesNavbar from "../CategoriesNavbar";
import NavigationBar from "../NavigationBar";
import Vedio from "../Vedio";

const Header = () => {
  return (
    <header>
      <NavigationBar />
      <CategoriesNavbar />
      <Vedio />
    </header>
  );
};

export default Header;