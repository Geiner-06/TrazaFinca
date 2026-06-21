import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import App from "./App";

describe("Prueba de Humo del MVP", () => {
  it("Debe mostrar el nombre de la plataforma", () => {
    render(<App />);
    // Busca que en el componente App exista el texto "TrazaFinca"
    expect(screen.getByText(/TrazaFinca/i)).toBeInTheDocument();
  });
});
