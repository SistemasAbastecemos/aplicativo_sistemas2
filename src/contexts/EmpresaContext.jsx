import { createContext, useContext, useState, useEffect } from "react";

const EmpresaContext = createContext();

export function EmpresaProvider({ children }) {
  const [empresa, setEmpresa] = useState(() => {
    return localStorage.getItem("empresa") || "abastecemos";
  });

  useEffect(() => {
    localStorage.setItem("empresa", empresa);

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
