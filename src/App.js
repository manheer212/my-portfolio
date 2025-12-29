import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { NavBar } from "./components/NavBar";
import { Banner } from "./components/Banner";
import { Skills } from "./components/Skills";
import { Projects } from "./components/Projects";
import { Contact } from "./components/Contact";
import { Footer } from "./components/Footer";
import SplashCursor from './SplashCursor';
import Iridescence from './Iridescence';
import Carousel from "./Carousel";

const skillsData = [
  { imgUrl: "https://upload.wikimedia.org/wikipedia/commons/a/a7/React-icon.svg", altText: "React" },
  { imgUrl: "https://upload.wikimedia.org/wikipedia/commons/6/61/HTML5_logo_and_wordmark.svg", altText: "HTML5" },
  { imgUrl: "https://upload.wikimedia.org/wikipedia/commons/d/d5/CSS3_logo_and_wordmark.svg", altText: "CSS3" },
  { imgUrl: "https://upload.wikimedia.org/wikipedia/commons/9/99/Unofficial_JavaScript_logo_2.svg", altText: "JavaScript" },
  { imgUrl: "https://upload.wikimedia.org/wikipedia/commons/b/b2/Bootstrap_logo.svg", altText: "Bootstrap" },
  { imgUrl: "https://upload.wikimedia.org/wikipedia/commons/3/3f/Git_icon.svg", altText: "Git" },
];

function App() {
  return (

    <div className="App">
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: -1 }}>
        <Iridescence
          color={[1, 1, 1]} // RGB values (0-1). [1,1,1] is white/multi-color.
          mouseReact={false}
          amplitude={0.1}
          speed={1.0}
        />
      </div>
      <SplashCursor />
      <NavBar />
      <Banner />
      <Skills />
      {/* Centered Carousel Container */}
      <div style={{ 
        height: '500px', 
        width: '100%', 
        position: 'relative', 
        zIndex: 10,
        display: 'flex',          /* Centers the content */
        justifyContent: 'center', /* Horizontal Center */
        alignItems: 'center',     /* Vertical Center */
        marginTop: '-50px'        /* Adjust spacing if needed */
      }}>
        <Carousel
          items={skillsData}
          baseWidth={300}    /* Use 'baseWidth' for this component, not 'size' */
          autoplay={true}
          loop={true}
          pauseOnHover={true}
        />
      </div>
      <Projects />
      <Contact />
      <Footer />
    </div>
  );
}


export default App;