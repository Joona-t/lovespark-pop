"""Export the dance in a dance.blend as a small GLB: the armature and its baked animation only (no meshes).
   blender --background <dance.blend> --python export_action.py -- <out.glb>"""
import bpy, sys
out = sys.argv[sys.argv.index("--") + 1]
arm = next(o for o in bpy.data.objects if o.type == "ARMATURE")
sc = bpy.context.scene
act = arm.animation_data.action.name if arm.animation_data and arm.animation_data.action else None
print("INFO frames", sc.frame_start, sc.frame_end, "fps", sc.render.fps, "action", act, "bones", len(arm.data.bones))
try:
    bpy.ops.object.mode_set(mode="OBJECT")
except Exception:
    pass
for o in bpy.context.view_layer.objects:
    o.select_set(False)
arm.select_set(True)
bpy.context.view_layer.objects.active = arm
base = dict(filepath=out, export_format="GLB", use_selection=True, export_animations=True)
tries = [dict(export_force_sampling=True, export_frame_range=True, export_animation_mode="ACTIVE_ACTIONS", export_optimize_animation_size=False),
         dict(export_force_sampling=True, export_frame_range=True), dict()]
for extra in tries:
    try:
        bpy.ops.export_scene.gltf(**base, **extra)
        print("EXPORT_OK", out, sorted(extra))
        break
    except Exception as e:
        print("EXPORT_RETRY", type(e).__name__, str(e)[:200])
