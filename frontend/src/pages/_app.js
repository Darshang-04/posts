import {AuthProvider } from "@/context/authcontext";
import "@/styles/globals.css";
import Navbar from "./components/Navbar";

export default function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <Navbar></Navbar>
      <Component {...pageProps} />
    </AuthProvider>
    
  );
}
