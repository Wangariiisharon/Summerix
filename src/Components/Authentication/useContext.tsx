import { ReactNode, createContext, useContext, useEffect, useState } from "react"; 
import {AuthContext} from "./AuthProvider";

export function useAuthContext() { 
    return useContext(AuthContext);
  } 