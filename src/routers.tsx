import React, { lazy } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import SuspenseLoader from 'components/SuspenseLoader';

const Landing = lazy(() => import('./pages/Landing'));
const Login = lazy(() => import('./pages/Login-Page/login'));
const CadastroEscola = lazy(() => import('./pages/Escola-Page/cadastro-escola'));
const CadastroCoord = lazy(() => import('./pages/Coord-Page/cadastro-coord'));
const CadastroProf = lazy(() => import('./pages/Prof-Page/cadastro-prof'));
const TurmaProf = lazy(() => import('./pages/Prof-Page/turmas-prof'));
const CoordAmbiente = lazy(() => import('./pages/Coord-Page/coord-Ambiente/ambiente'));
const CoordTurmas = lazy(() => import('./pages/Coord-Page/coord-Ambiente/coord-Funcoes/turma-coord'));
const TurmaGradeDetalhe = lazy(
  () => import('./pages/Coord-Page/coord-Ambiente/coord-Funcoes/turma-grade-detalhe')
);
const GradeCoord = lazy(() => import('./pages/Coord-Page/coord-Ambiente/coord-Funcoes/grade'));
const ProfCoord = lazy(() => import('./pages/Coord-Page/coord-Ambiente/coord-Funcoes/professores'));
const Sobre = lazy(() => import('./pages/Sobre/sobre'));

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <SuspenseLoader>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/entrar" element={<Login />} />
          <Route path="/cadastroescola" element={<CadastroEscola />} />
          <Route path="/cadastrocoord" element={<CadastroCoord />} />
          <Route path="/cadastroprof" element={<CadastroProf />} />
          <Route path="/profturmas" element={<TurmaProf />} />
          <Route path="/coordambiente" element={<CoordAmbiente />} />
          <Route path="/coordturmas" element={<CoordTurmas />} />
          <Route path="/coordgrade" element={<GradeCoord />} />
          <Route path="/coordprof" element={<ProfCoord />} />
          <Route path="/turmas/:codigo" element={<TurmaGradeDetalhe />} />
          <Route path="/sobre" element={<Sobre />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SuspenseLoader>
    </BrowserRouter>
  );
};

export default AppRoutes;
