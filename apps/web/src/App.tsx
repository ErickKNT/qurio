import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DashboardLayout, WorkspaceLayout } from '@/components/templates';
import { KbdShortcut } from '@/components/atoms';
import {
  GuestTrialCompleteModal,
  ModuleCompletedModal,
  RevealSolutionModal,
  MethodologyModal,
} from '@/components/molecules';
import { AuthModal, AuthMode } from '@/components/molecules/AuthModal/AuthModal';
import {
  DataGridResults,
  DashboardHomeView,
  ExerciseHeaderBar,
} from '@/components/organisms';
import type { CertificateData } from '@/components/organisms/CertificateModal/CertificateModal';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useAppRouter, useDocumentTitle } from '@/hooks/useAppRouter';
import { useCurriculumState, GUEST_TRIAL_EXERCISE_IDS } from '@/hooks/useCurriculumState';
import { useExerciseWorkspace } from '@/hooks/useExerciseWorkspace';
import { api } from '@/lib/api';
import type { ModuleGuide } from '@/lib/moduleGuides';
import { CertificateRecord, Track, AppPath } from '@/types';

// Lazy loading de vistas secundarias y estación de trabajo para optimización y code splitting del bundle
const MonacoEditorPanel = React.lazy(() =>
  import('@/components/organisms/MonacoEditorPanel/MonacoEditorPanel').then((m) => ({
    default: m.MonacoEditorPanel,
  }))
);
const ExerciseSpecPanel = React.lazy(() =>
  import('@/components/organisms/ExerciseSpecPanel/ExerciseSpecPanel').then((m) => ({
    default: m.ExerciseSpecPanel,
  }))
);
const TracksView = React.lazy(() =>
  import('@/components/organisms/TracksView/TracksView').then((m) => ({
    default: m.TracksView,
  }))
);
const AdminDashboardView = React.lazy(() =>
  import('@/components/organisms/AdminDashboardView/AdminDashboardView').then((m) => ({
    default: m.AdminDashboardView,
  }))
);
const SqlPlaygroundView = React.lazy(() =>
  import('@/components/organisms/SqlPlaygroundView/SqlPlaygroundView').then((m) => ({
    default: m.SqlPlaygroundView,
  }))
);
const AchievementsView = React.lazy(() =>
  import('@/components/organisms/AchievementsView/AchievementsView').then((m) => ({
    default: m.AchievementsView,
  }))
);
const UserProfileView = React.lazy(() =>
  import('@/components/organisms/UserProfileView/UserProfileView').then((m) => ({
    default: m.UserProfileView,
  }))
);
const NotFoundView = React.lazy(() =>
  import('@/components/organisms/NotFoundView/NotFoundView').then((m) => ({
    default: m.NotFoundView,
  }))
);
const AuthConfirmView = React.lazy(() =>
  import('@/components/organisms/AuthConfirmView/AuthConfirmView').then((m) => ({
    default: m.AuthConfirmView,
  }))
);
const ResetPasswordView = React.lazy(() =>
  import('@/components/organisms/ResetPasswordView/ResetPasswordView').then((m) => ({
    default: m.ResetPasswordView,
  }))
);
const SqlReferenceView = React.lazy(() =>
  import('@/components/organisms/SqlReferenceView/SqlReferenceView').then((m) => ({
    default: m.SqlReferenceView,
  }))
);
const CommandPaletteModal = React.lazy(() =>
  import('@/components/organisms/CommandPaletteModal/CommandPaletteModal').then((m) => ({
    default: m.CommandPaletteModal,
  }))
);
const ModuleGuideModal = React.lazy(() =>
  import('@/components/organisms/ModuleGuideModal/ModuleGuideModal').then((m) => ({
    default: m.ModuleGuideModal,
  }))
);
const CertificateVerifyView = React.lazy(() =>
  import('@/components/organisms/CertificateVerifyView/CertificateVerifyView').then((m) => ({
    default: m.CertificateVerifyView,
  }))
);
const CertificateModal = React.lazy(() =>
  import('@/components/organisms/CertificateModal/CertificateModal').then((m) => ({
    default: m.CertificateModal,
  }))
);

function toCertificateData(record: CertificateRecord): CertificateData {
  return {
    id: record.id,
    recipientName: record.recipient_name,
    trackTitle: record.track_title,
    completedExercises: record.completed_exercises,
    totalExercises: record.total_exercises,
    issuedDate: new Date(record.issued_at).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    verificationCode: record.verification_code,
    isGlobal: record.track_id === 'global-curriculum',
    isQaPreview: record.is_qa_preview,
    verifyUrl: record.verify_url,
    pdfUrl: record.pdf_url,
    linkedinUrl: record.linkedin_url,
  };
}

const ViewLoadingFallback: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-[360px] gap-3 text-content-muted">
    <div className="w-6 h-6 border-2 border-cyan-accent border-t-transparent rounded-full animate-spin" />
    <span className="text-xs font-mono text-cyan-accent/80">Cargando módulo de la aplicación...</span>
  </div>
);

export const App: React.FC = () => {
  const {
    profile,
    user,
    isCloudAuth,
    isAuthenticated,
    isAdmin,
    isPasswordRecovery,
    guestSyncCount,
    clearPasswordRecovery,
    signOut,
    updateProfile,
    refreshProfile,
  } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Estados de modales globales y vistas auxiliares
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<AuthMode>('signin');
  const [guestTrialModalOpen, setGuestTrialModalOpen] = useState(false);
  const [methodologyModalOpen, setMethodologyModalOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [activePaletteGuide, setActivePaletteGuide] = useState<ModuleGuide | null>(null);
  const [playgroundInitialQuery, setPlaygroundInitialQuery] = useState<string | undefined>(
    undefined
  );
  const [tracksCertificate, setTracksCertificate] = useState<CertificateData | null>(null);

  // Atajo global Cmd+K / Ctrl+K para Búsqueda Rápida en toda la aplicación (H06)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // 1. Estado del Currículum, Progreso y Gamificación
  const {
    exercises,
    setExercises,
    tracks,
    tables,
    authoritativeCompletedIds,
    isProgressLoading,
    queryHistory,
    dailyActivity,
    totalAttemptsCount,
    attemptStats,
    recommendedExercise,
    activeLearningData,
    evaluatedAchievements,
    recordPassedSubmission,
  } = useCurriculumState({
    profile,
    isAuthenticated,
    guestSyncCount,
    refreshProfile,
  });

  // 2. Enrutamiento con History API y sincronización de URL
  const locationExerciseHandlerRef = useRef<(exerciseId: string) => void>(() => {});
  const { currentPath, verifyCode, navigate, getHeaderTitle } = useAppRouter({
    isPasswordRecovery,
    clearPasswordRecovery,
    onLocationExerciseId: (id) => locationExerciseHandlerRef.current(id),
  });

  // 3. Estado y Ejecución de la Estación de Trabajo SQL
  const {
    currentExerciseIndex,
    activeExercise,
    sqlCode,
    hintsUnlocked,
    isExecuting,
    isResultsExpanded,
    setIsResultsExpanded,
    executionStatus,
    executionTime,
    rowCount,
    resultColumns,
    resultRows,
    resultError,
    resultDiff,
    resultMessage,
    awardedXp,
    failedAttemptsByExercise,
    revealedSolutions,
    isRevealModalOpen,
    setIsRevealModalOpen,
    isRevealingSolution,
    isTrialResult,
    moduleCompletionSummary,
    nextExerciseLabel,
    dismissModuleCompletion,
    continueAfterModuleCompletion,
    viewTracksFromModuleCompletion,
    handleLocationExerciseId,
    handleSelectExercise,
    handleOpenExerciseFromCatalog,
    handleUnlockHint,
    handleLoadSolutionIntoEditor,
    handleAdminUnlockAllHints,
    handleAdminInstantReveal,
    handleConfirmRevealSolution,
    handleRunExerciseTrial,
    handleExecuteSolution,
    handleNextExercise,
    handleSqlCodeChange,
    handleResetEditor,
  } = useExerciseWorkspace({
    exercises,
    setExercises,
    tracks,
    authoritativeCompletedIds,
    profile,
    isAdmin,
    navigate,
    onOpenGuestTrialModal: () => setGuestTrialModalOpen(true),
    recordPassedSubmission,
  });

  locationExerciseHandlerRef.current = handleLocationExerciseId;

  // 4. Sincronización dinámica de document.title
  useDocumentTitle({
    currentPath,
    activeExercise,
    tracks,
    isAdmin,
  });

  // Iniciar un reto por ID desde el Dashboard apilando en el historial (H08)
  const handleStartExerciseById = useCallback(
    (exerciseId: string) => {
      const targetIdx = exercises.findIndex((e) => e.id === exerciseId);
      handleSelectExercise(targetIdx >= 0 ? targetIdx : 0, false);
    },
    [exercises, handleSelectExercise]
  );

  // Emitir constancia desde Rutas sin contaminar resultError del IDE (H07)
  const handleIssueTrackCertificate = useCallback(
    async (track: Track, qaPreview: boolean) => {
      try {
        const record = await api.issueCertificate({
          track_id: track.id,
          track_title: track.title,
          recipient_name: profile?.full_name || profile?.username || 'Estudiante Qurio',
          total_exercises: track.total_exercises || 20,
          qa_preview: qaPreview,
        });
        setTracksCertificate(toCertificateData(record));
      } catch (err: unknown) {
        console.error('[App] No se pudo emitir la constancia:', err);
      }
    },
    [profile]
  );

  return (
    <>
      {/* VISTA 0: CONSOLA DE ADMINISTRACIÓN Y LIVE OPS (/admin — RBAC + SIGILO) */}
      {currentPath === 'admin' && isAdmin ? (
        <React.Suspense fallback={<ViewLoadingFallback />}>
          <AdminDashboardView onBackToDashboard={() => navigate('dashboard')} />
        </React.Suspense>
      ) : currentPath === 'exercise' ? (
        /* VISTA 1: ESPACIO DE TRABAJO DEL EJERCICIO (IDE INTERACTIVO CON MONACO) */
        <WorkspaceLayout
          isResultsExpanded={isResultsExpanded}
          onToggleResultsExpanded={setIsResultsExpanded}
          headerBar={
            <ExerciseHeaderBar
              activeExercise={activeExercise}
              exercises={exercises}
              currentExerciseIndex={currentExerciseIndex}
              tracks={tracks}
              isAuthenticated={isAuthenticated}
              profile={profile}
              isDark={isDark}
              onToggleTheme={toggleTheme}
              onSelectExercise={handleSelectExercise}
              onNavigateTracks={() => navigate('tracks')}
              onOpenAuth={() => setAuthModalOpen(true)}
              onSignOut={signOut}
            />
          }
          sidebarContent={
            <React.Suspense fallback={<ViewLoadingFallback />}>
              <ExerciseSpecPanel
                exercise={activeExercise}
                unlockedHintsCount={hintsUnlocked}
                onUnlockHint={handleUnlockHint}
                isCompleted={activeExercise.is_completed || executionStatus === 'SUCCESS'}
                failedAttemptsCount={failedAttemptsByExercise[activeExercise.id] || 0}
                isSolutionRevealed={Boolean(revealedSolutions[activeExercise.id])}
                solutionQuery={revealedSolutions[activeExercise.id] || null}
                onOpenRevealModal={() => setIsRevealModalOpen(true)}
                onLoadSolutionIntoEditor={handleLoadSolutionIntoEditor}
                isAdmin={isAdmin}
                onAdminUnlockAllHints={handleAdminUnlockAllHints}
                onAdminInstantReveal={handleAdminInstantReveal}
              />
            </React.Suspense>
          }
          editorContent={
            <React.Suspense fallback={<ViewLoadingFallback />}>
              <MonacoEditorPanel
                value={sqlCode}
                onChange={handleSqlCodeChange}
                onExecute={handleExecuteSolution}
                onRunTrial={handleRunExerciseTrial}
                onReset={handleResetEditor}
                isLoading={isExecuting}
                isSubmitMode={true}
              />
            </React.Suspense>
          }
          resultsContent={
            <DataGridResults
              status={executionStatus}
              executionTimeMs={executionTime}
              rowCount={rowCount}
              columns={resultColumns}
              rows={resultRows}
              error={resultError}
              diff={resultDiff}
              message={resultMessage}
              xpAwarded={isTrialResult ? undefined : awardedXp}
              onNextExercise={handleNextExercise}
              nextExerciseLabel={nextExerciseLabel}
              isPlayground={isTrialResult}
              failedAttemptsCount={failedAttemptsByExercise[activeExercise.id] || 0}
              isSolutionRevealed={Boolean(revealedSolutions[activeExercise.id])}
              onOpenRevealModal={() => setIsRevealModalOpen(true)}
              isExpanded={isResultsExpanded}
              onToggleExpand={() => setIsResultsExpanded((prev) => !prev)}
            />
          }
          statusBar={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-4">
                <span>PostgreSQL 16.3 (Sandbox Docker)</span>
                <span className="hidden sm:inline">DB: ecommerce_sandbox</span>
                <span className="hidden md:inline">User: readonly_student</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="hidden sm:flex items-center gap-2">
                  <KbdShortcut keys={['⌘', '⇧', '↵']} />
                  <span>probar</span>
                </div>
                <div className="flex items-center gap-2">
                  <KbdShortcut keys={['⌘', '↵']} />
                  <span>evaluar</span>
                </div>
              </div>
            </div>
          }
        />
      ) : (
        /* VISTA 2: DASHBOARD LAYOUT (DASHBOARD, TRACKS, PLAYGROUND, ACHIEVEMENTS, PROFILE) */
        <DashboardLayout
          currentPath={currentPath}
          onNavigate={(path) => navigate(path as AppPath)}
          title={getHeaderTitle()}
          onOpenSearch={() => setCommandPaletteOpen(true)}
          onOpenAuth={() => setAuthModalOpen(true)}
        >
          {/* VISTA A: RUTAS DE APRENDIZAJE */}
          {currentPath === 'tracks' && (
            <React.Suspense fallback={<ViewLoadingFallback />}>
              <TracksView
                tracks={tracks}
                exercises={exercises}
                completedExerciseIds={authoritativeCompletedIds}
                onSelectExercise={handleOpenExerciseFromCatalog}
                onOpenMethodology={() => setMethodologyModalOpen(true)}
                onIssueTrackCertificate={handleIssueTrackCertificate}
                isAdmin={isAdmin}
                isLoading={isProgressLoading}
              />
            </React.Suspense>
          )}

          {/* VISTA B: SQL PLAYGROUND LIBRE */}
          {currentPath === 'playground' && (
            <React.Suspense fallback={<ViewLoadingFallback />}>
              <SqlPlaygroundView tables={tables} initialQuery={playgroundInitialQuery} />
            </React.Suspense>
          )}

          {/* VISTA B2: REFERENCIA RÁPIDA SQL */}
          {currentPath === 'reference' && (
            <React.Suspense fallback={<ViewLoadingFallback />}>
              <SqlReferenceView
                onOpenPlayground={(query) => {
                  setPlaygroundInitialQuery(query);
                  navigate('playground');
                }}
              />
            </React.Suspense>
          )}

          {/* VISTA C: LOGROS & MEDALLAS */}
          {currentPath === 'achievements' && (
            <React.Suspense fallback={<ViewLoadingFallback />}>
              <AchievementsView
                achievements={evaluatedAchievements}
                totalXp={profile?.total_xp ?? 0}
                level={profile?.current_level ?? 1}
              />
            </React.Suspense>
          )}

          {/* VISTA D: MI PERFIL */}
          {currentPath === 'profile' && (
            <React.Suspense fallback={<ViewLoadingFallback />}>
              <UserProfileView
                profile={profile}
                history={queryHistory}
                tracks={tracks}
                completedCount={authoritativeCompletedIds.size}
                totalExercises={exercises.length}
                totalAttemptsCount={totalAttemptsCount}
                attemptStats={attemptStats}
                achievements={evaluatedAchievements}
                dailyActivity={dailyActivity}
                onOpenPlayground={(query?: string) => {
                  if (query) {
                    setPlaygroundInitialQuery(query);
                  }
                  navigate('playground');
                }}
                onOpenAuth={() => setAuthModalOpen(true)}
                onOpenVerifyPage={(code) => navigate('verify', { verifyCode: code })}
                onSelectTrack={(trackSlug) => navigate('tracks', { trackSlug })}
                onNavigateAchievements={() => navigate('achievements')}
                onUpdateProfile={updateProfile}
                isCloudAuth={isCloudAuth}
                isAdmin={isAdmin}
              />
            </React.Suspense>
          )}

          {/* VISTA D2: VERIFICACIÓN PÚBLICA DE CONSTANCIA (/verify/:code) */}
          {currentPath === 'verify' && (
            <React.Suspense fallback={<ViewLoadingFallback />}>
              <CertificateVerifyView
                verificationCode={verifyCode}
                onNavigateDashboard={() => navigate('dashboard')}
              />
            </React.Suspense>
          )}

          {/* VISTA E: ERROR 404 (RELATION NOT FOUND) — incluye sigilo absoluto de /admin para no-admins */}
          {(currentPath === 'not-found' || (currentPath === 'admin' && !isAdmin)) && (
            <React.Suspense fallback={<ViewLoadingFallback />}>
              <NotFoundView
                missingPath={currentPath === 'admin' ? 'admin' : 'v_reporte_anual'}
                onNavigate={(path) => navigate(path as AppPath)}
              />
            </React.Suspense>
          )}

          {/* VISTA F: CONFIRMACIÓN DE CUENTA SUPABASE (EMAIL VERIFICATION) */}
          {currentPath === 'auth-confirm' && (
            <React.Suspense fallback={<ViewLoadingFallback />}>
              <AuthConfirmView
                onNavigate={(path) => navigate(path as AppPath)}
                userEmail={profile?.username ? `${profile.username}@qurio.dev` : undefined}
              />
            </React.Suspense>
          )}

          {/* VISTA G: RESTABLECER CONTRASEÑA */}
          {currentPath === 'reset-password' && (
            <React.Suspense fallback={<ViewLoadingFallback />}>
              <ResetPasswordView
                onNavigate={(path) => navigate(path as AppPath)}
                onRequestNewLink={() => {
                  navigate('dashboard');
                  setAuthModalInitialMode('forgot');
                  setAuthModalOpen(true);
                }}
              />
            </React.Suspense>
          )}

          {/* VISTA H: DASHBOARD PRINCIPAL */}
          {currentPath === 'dashboard' && (
            <DashboardHomeView
              isAuthenticated={isAuthenticated}
              isAdmin={isAdmin}
              profile={profile}
              user={user}
              activeLearningData={activeLearningData}
              recommendedExercise={recommendedExercise}
              exercisesCount={exercises.length}
              completedCount={authoritativeCompletedIds.size}
              totalAttemptsCount={totalAttemptsCount}
              queryHistoryCount={queryHistory.length}
              tables={tables}
              onStartExerciseById={handleStartExerciseById}
              onNavigate={(path) => navigate(path)}
              onOpenAuth={() => setAuthModalOpen(true)}
              onOpenMethodology={() => setMethodologyModalOpen(true)}
            />
          )}
        </DashboardLayout>
      )}

      {/* ==========================================================================
          MODALES GLOBALES UNIFICADOS (Accesibles desde cualquier ruta, incl. IDE)
         ========================================================================== */}
      <RevealSolutionModal
        isOpen={isRevealModalOpen}
        onClose={() => setIsRevealModalOpen(false)}
        onConfirmReveal={handleConfirmRevealSolution}
        exerciseTitle={activeExercise.title}
        failedAttempts={failedAttemptsByExercise[activeExercise.id] || 0}
        isLoading={isRevealingSolution}
      />

      <ModuleCompletedModal
        isOpen={Boolean(moduleCompletionSummary)}
        summary={moduleCompletionSummary}
        lastXpAwarded={awardedXp}
        onClose={dismissModuleCompletion}
        onContinueNextModule={continueAfterModuleCompletion}
        onViewTracks={viewTracksFromModuleCompletion}
      />

      <GuestTrialCompleteModal
        isOpen={guestTrialModalOpen}
        onClose={() => setGuestTrialModalOpen(false)}
        onOpenSignUp={() => {
          setGuestTrialModalOpen(false);
          setAuthModalInitialMode('signup');
          setAuthModalOpen(true);
        }}
        onOpenSignIn={() => {
          setGuestTrialModalOpen(false);
          setAuthModalInitialMode('signin');
          setAuthModalOpen(true);
        }}
        solvedCount={3}
        remainingCount={Math.max(0, exercises.length - GUEST_TRIAL_EXERCISE_IDS.size)}
        earnedXp={100}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authModalInitialMode}
      />

      <React.Suspense fallback={null}>
        <CommandPaletteModal
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          exercises={exercises}
          tables={tables}
          onSelectExercise={handleOpenExerciseFromCatalog}
          onSelectGuide={(guide) => setActivePaletteGuide(guide)}
          onSelectTable={(table) => {
            setPlaygroundInitialQuery(`SELECT * FROM ${table.tableName} LIMIT 50;`);
            navigate('playground');
          }}
          onSelectReference={() => navigate('reference')}
        />
        <ModuleGuideModal
          guide={activePaletteGuide}
          isOpen={Boolean(activePaletteGuide)}
          onClose={() => setActivePaletteGuide(null)}
        />
        <CertificateModal
          certificate={tracksCertificate}
          isOpen={Boolean(tracksCertificate)}
          onClose={() => setTracksCertificate(null)}
          onOpenVerifyPage={(code) => navigate('verify', { verifyCode: code })}
        />
      </React.Suspense>

      <MethodologyModal
        isOpen={methodologyModalOpen}
        onClose={() => setMethodologyModalOpen(false)}
      />
    </>
  );
};

export default App;
