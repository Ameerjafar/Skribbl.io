import { createContext } from "react";

const DrawerContext = createContext({
  prevPoint: { x: 0, y: 0 },
  currPoint: { x: 0, y: 0 },
});

export const DrawerContextProvider = ({children}) => {
  
}
