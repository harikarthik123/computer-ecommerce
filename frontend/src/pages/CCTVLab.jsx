import { useMemo, useState } from "react";
import { CameraPlacementViewer, CameraPOVViewer } from "../three/ProductViewer";

function CCTVLab() {
  const cameraSpots = useMemo(
    () => [
      {
        id: "cam-entrance",
        name: "Entrance Camera",
        coverage: "Front entry and waiting zone",
        position: [-10, 5, -9],
        rotation: [0, 0.72, 0],
        povTarget: [-2, 1.8, -2]
      },
      {
        id: "cam-cash",
        name: "Cash Counter Camera",
        coverage: "Billing desk and side aisle",
        position: [9, 5, -8],
        rotation: [0, -0.78, 0],
        povTarget: [3, 1.8, -1]
      },
      {
        id: "cam-center",
        name: "Center Ceiling Camera",
        coverage: "Main floor overview",
        position: [0, 5.3, 0],
        rotation: [-0.25, 0, 0],
        povTarget: [0, 1.5, -4]
      },
      {
        id: "cam-stock",
        name: "Stock Area Camera",
        coverage: "Back storage and loading door",
        position: [-8, 5, 9],
        rotation: [0, 2.42, 0],
        povTarget: [-2, 1.8, 3]
      }
    ],
    []
  );

  const [activeCameraId, setActiveCameraId] = useState(cameraSpots[0].id);
  const [popupView, setPopupView] = useState(null);
  const activeCamera = cameraSpots.find((cam) => cam.id === activeCameraId) || cameraSpots[0];
  const popupCamera =
    popupView?.type === "pov"
      ? cameraSpots.find((cam) => cam.id === popupView.cameraId) || cameraSpots[0]
      : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="rounded-2xl border border-cyan-200/20 bg-slate-900/70 p-6">
          <p className="inline-flex rounded-full border border-cyan-300/40 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-cyan-300">
            Simulation Mode
          </p>
          <h1 className="mt-3 text-3xl font-black text-slate-100">3D CCTV Environment Simulation</h1>
          <p className="mt-2 text-slate-300">
            This is a simulated store layout with fixed cameras and live 3D POV previews for each camera.
          </p>
        </div>

        <div className="rounded-2xl border border-cyan-200/20 bg-slate-900/70 p-4">
          <h3 className="text-lg font-bold text-cyan-300">3D Environment Overview</h3>
          <p className="mt-1 text-sm text-slate-300">Drag to orbit and inspect the full simulated room and camera placements.</p>
          <p className="mt-2 text-sm text-cyan-200">
            Focused camera: <span className="font-semibold">{activeCamera.name}</span>
          </p>
          <div
            className="mt-4 cursor-zoom-in"
            onDoubleClick={() => setPopupView({ type: "overview" })}
            title="Double click to open preview"
          >
            <CameraPlacementViewer cameras={cameraSpots} activeCameraId={activeCameraId} />
          </div>
        </div>

        <div className="rounded-2xl border border-cyan-200/20 bg-slate-900/70 p-4">
          <h3 className="text-lg font-bold text-cyan-300">Camera POV Views (3D)</h3>
          <p className="mt-1 text-sm text-slate-300">Click any tile to focus that camera in the overview scene.</p>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
            {cameraSpots.map((cam) => (
              <button
                key={cam.id}
                onClick={() => setActiveCameraId(cam.id)}
                onDoubleClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPopupView({ type: "pov", cameraId: cam.id });
                }}
                className={`rounded-xl border bg-slate-900/80 p-3 text-left transition ${
                  cam.id === activeCameraId
                    ? "border-cyan-400 ring-1 ring-cyan-400/50"
                    : "border-slate-700 hover:border-slate-500"
                }`}
                title="Click to focus, double click to open preview"
              >
                <p className="mb-2 font-semibold text-slate-100">{cam.name}</p>
                <CameraPOVViewer cameras={cameraSpots} cameraConfig={cam} />
                <p className="mt-2 text-xs text-slate-400">Coverage: {cam.coverage}</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Position: [{cam.position.join(", ")}] | Rotation: [{cam.rotation.join(", ")}]
                </p>
              </button>
            ))}
          </div>
        </div>

        {popupView && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
            onClick={() => setPopupView(null)}
          >
            <div
              className="w-full max-w-4xl rounded-2xl border border-cyan-200/20 bg-slate-950 p-4 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-lg font-bold text-slate-100">
                  {popupView.type === "overview" ? "Environment Overview" : `${popupCamera?.name} POV`}
                </h4>
                <button
                  onClick={() => setPopupView(null)}
                  className="rounded-lg border border-slate-700 px-3 py-1 text-sm text-slate-200 hover:bg-slate-800"
                >
                  Close
                </button>
              </div>

              {popupView.type === "overview" ? (
                <CameraPlacementViewer cameras={cameraSpots} activeCameraId={activeCameraId} />
              ) : (
                <div className="h-[420px]">
                  {popupCamera && <CameraPOVViewer cameras={cameraSpots} cameraConfig={popupCamera} />}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CCTVLab;
