import { createContext, useContext, useState, useEffect } from "react";

const EmpresaContext = createContext();

export function EmpresaProvider({ children }) {
  const [empresa, setEmpresa] = useState("abastecemos");

  useEffect(() => {
    document.body.classList.remove("abastecemos", "tobar");

    document.body.classList.add(empresa);
  }, [empresa]);

  return (
    <EmpresaContext.Provider value={{ empresa, setEmpresa }}>
      {children}
    </EmpresaContext.Provider>
  );
}

export function useEmpresa() {
  return useContext(EmpresaContext);
}
