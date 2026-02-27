import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {Box, Container, Typography, Paper, Grid, TextField, MenuItem, Button,Table, TableBody, TableCell, TableContainer, TableHead, TableRow,IconButton, Tooltip, Snackbar, Alert, CircularProgress, Divider, Stack,FormControl, Select, Dialog, DialogTitle, DialogContent, DialogContentText,DialogActions, Fade, Chip, useMediaQuery, Collapse,} from "@mui/material";
import {Save as SaveIcon, Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon,Check as CheckIcon, Close as CloseIcon, CalendarToday as CalendarIcon,LocationOn as LocationIcon, HealthAndSafety as SafetyIcon,ListAlt as ListAltIcon, FolderOpen as FolderIcon, Refresh as RefreshIcon,ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon,} from "@mui/icons-material";
import { createTheme, ThemeProvider, alpha, useTheme } from "@mui/material/styles";

const C = {
  p:    "#43A047", s:    "#81C784", bg:   "#F9FBF9", txt:  "#2E7D32",
  pDk:  "#388E3C", pLt:  "#E8F5E9", pXlt: "#F1F8F1", bdr:  "#C8E6C9",
  bdrM: "#A5D6A7", mute: "#66A96A", surf: "#FFFFFF",  sAlt: "#F9FBF9",
  shad: "rgba(67,160,71,0.10)",
  lc:"#2E7D32", lb:"#E8F5E9", ld:"#A5D6A7", ldot:"#4CAF50",
  mc:"#E65100", mb:"#FFF3E0", md:"#FFCC80", mdot:"#FFA726",
  hc:"#C62828", hb:"#FFEBEE", hd:"#EF9A9A", hdot:"#EF5350",
};

const theme = createTheme({
  palette: {
    primary:    { main:C.p, light:C.s, dark:C.pDk, contrastText:"#fff" },
    secondary:  { main:C.s, contrastText:"#fff" },
    background: { default:C.bg, paper:C.surf },
    text:       { primary:C.txt, secondary:C.mute },
    success:    { main:C.p }, warning:{ main:"#E65100" }, error:{ main:"#C62828" },
  },
  typography: { fontFamily:"'Nunito','Segoe UI',system-ui,sans-serif" },
  shape: { borderRadius:10 },
  components: {
    MuiPaper:  { styleOverrides:{ root:{ backgroundImage:"none" } } },
    MuiButton: { styleOverrides:{ root:{ borderRadius:8, textTransform:"none", fontWeight:700 } } },
    MuiTableCell: {
      styleOverrides: {
        head: {
          background:C.p, color:"#fff", fontWeight:700, fontSize:11.5,
          textTransform:"uppercase", letterSpacing:".07em", padding:"13px 16px",
          borderRight:`1px solid ${alpha("#fff",.18)}`, borderBottom:"none",
        },
        body: { fontSize:13.5, padding:"11px 16px", color:C.txt, borderBottom:`1px solid ${C.bdr}` },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius:8, fontSize:13.5,
          "&:hover .MuiOutlinedInput-notchedOutline":{ borderColor:C.s },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline":{ borderColor:C.p, borderWidth:2 },
        },
        notchedOutline: { borderColor:C.bdr },
      },
    },
    MuiInputLabel: { styleOverrides:{ root:{ fontSize:13.5, color:C.mute, "&.Mui-focused":{ color:C.p } } } },
    MuiMenuItem:   { styleOverrides:{ root:{ fontSize:13.5 } } },
    MuiTooltip: {
      styleOverrides: {
        tooltip:{ background:C.pDk, fontSize:12, fontWeight:600, borderRadius:6 },
        arrow:{ color:C.pDk },
      },
    },
  },
});

const API      = "/api";
const SAVE_API = "/api/PostHSE";  
const today    = () => new Date().toISOString().split("T")[0];

const RISK = {
  1:{ label:"Low",    c:C.lc, bg:C.lb, bd:C.ld, dot:C.ldot },
  2:{ label:"Medium", c:C.mc, bg:C.mb, bd:C.md, dot:C.mdot },
  3:{ label:"High",   c:C.hc, bg:C.hb, bd:C.hd, dot:C.hdot },
};

const RO = {
  "& .MuiOutlinedInput-root":{
    bgcolor:"#F1F8F1",
    "& input":{ color:C.mute, WebkitTextFillColor:C.mute },
    "&:hover .MuiOutlinedInput-notchedOutline":{ borderColor:C.bdr },
  },
};

const FL = ({ label, req }) => (
  <Typography sx={{ fontSize:11, fontWeight:700, color:C.txt, textTransform:"uppercase", letterSpacing:".07em", mb:.7 }}>
    {label}{req && <span style={{ color:"#C62828", marginLeft:2 }}>*</span>}
  </Typography>
);

const GreenBar = ({ h=4 }) => (
  <Box sx={{ height:h, background:`linear-gradient(90deg,${C.s} 0%,${C.p} 60%,${C.pDk} 100%)` }} />
);

function Card({ icon, title, action, children }) {
  return (
    <Paper elevation={0} sx={{ mb:3, overflow:"hidden", border:`1.5px solid ${C.bdr}`, boxShadow:`0 2px 14px ${C.shad}` }}>
      <GreenBar />
      <Box sx={{ px:{ xs:2, sm:3 }, py:2, background:C.pLt, borderBottom:`1.5px solid ${C.bdrM}`, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ width:34, height:34, borderRadius:"8px", bgcolor:alpha(C.p,.15), border:`1.5px solid ${C.bdrM}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            {icon}
          </Box>
          <Typography sx={{ fontWeight:800, fontSize:{ xs:13, sm:15 }, color:C.txt, letterSpacing:".01em" }}>{title}</Typography>
        </Stack>
        {action}
      </Box>
      <Box sx={{ p:{ xs:2, sm:3 }, bgcolor:"#FFFFFF" }}>{children}</Box>
    </Paper>
  );
}

function IBtn({ tip, onClick, c, bg, bd, icon }) {
  return (
    <Tooltip title={tip} arrow>
      <IconButton size="small" onClick={onClick} sx={{
        color:c, bgcolor:bg, border:`1.5px solid ${bd}`, borderRadius:"7px",
        width:34, height:34,
        transition:"all .14s",
        "&:hover":{ transform:"scale(1.1)", opacity:.85 },
      }}>
        {icon}
      </IconButton>
    </Tooltip>
  );
}

function RiskBadge({ level }) {
  const r = RISK[level] || RISK[2];
  return (
    <Box sx={{ display:"inline-flex", alignItems:"center", gap:.7, px:1.3, py:.5, borderRadius:"6px", bgcolor:r.bg, border:`1px solid ${r.bd}` }}>
      <Box sx={{ width:8, height:8, borderRadius:"50%", bgcolor:r.dot, flexShrink:0 }} />
      <Typography fontSize={12.5} fontWeight={700} color={r.c}>{r.label}</Typography>
    </Box>
  );
}

/* ── Mobile Row Card ─────────────────────────── */
function MobileRowCard({ row, idx, ed, editId, employees, empById, upd, done, cancel, setEditId, setConfirmId }) {
  const [expanded, setExpanded] = useState(ed);
  useEffect(() => { if (ed) setExpanded(true); }, [ed]);

  const emp = empById(row.ActionBy);

  return (
    <Paper elevation={0} sx={{
      mb:1.5, border:`1.5px solid ${ed ? C.p : row._unsaved ? C.md : C.bdr}`,
      borderRadius:"10px", overflow:"hidden",
      boxShadow: ed ? `0 2px 12px ${alpha(C.p,.15)}` : `0 1px 4px ${C.shad}`,
    }}>
      {/* Card Header */}
      <Box sx={{
        px:2, py:1.5,
        bgcolor: ed ? alpha(C.p,.06) : idx % 2 === 0 ? "#fff" : C.sAlt,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        borderBottom: expanded ? `1px solid ${C.bdr}` : "none",
      }}>
        <Stack direction="row" alignItems="center" spacing={1.2} sx={{ flex:1, minWidth:0 }}>
          <Box sx={{ width:26, height:26, borderRadius:"6px", bgcolor:C.pLt, border:`1px solid ${C.bdrM}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
            <Typography fontSize={11} fontWeight={800} color={C.txt}>#{idx+1}</Typography>
          </Box>
          <Typography fontSize={13} fontWeight={600} color={row.Observation ? C.txt : C.mute}
            fontStyle={row.Observation ? "normal" : "italic"}
            sx={{ overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", flex:1 }}>
            {row.Observation || "No observation yet…"}
          </Typography>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={.5} sx={{ flexShrink:0, ml:1 }}>
          <RiskBadge level={row.RiskLevel} />
          <IconButton size="small" onClick={() => setExpanded(v => !v)} sx={{ color:C.mute }}>
            {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
          </IconButton>
        </Stack>
      </Box>

      <Collapse in={expanded}>
        <Box sx={{ px:2, py:2, bgcolor:"#fff" }}>
          <Grid container spacing={1.5}>
            <Grid item xs={12}>
              <FL label="Observation" />
              {ed ? (
                <TextField fullWidth size="small" autoFocus value={row.Observation}
                  onChange={e => upd(row.id, "Observation", e.target.value)}
                  placeholder="Describe the observation…" multiline minRows={2} />
              ) : (
                <Typography fontSize={13.5} color={row.Observation ? C.txt : C.mute} fontStyle={row.Observation ? "normal" : "italic"}>
                  {row.Observation || "—"}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12} sm={6}>
              <FL label="Risk Level" />
              {ed ? (
                <TextField select fullWidth size="small" value={row.RiskLevel}
                  onChange={e => upd(row.id, "RiskLevel", Number(e.target.value))}>
                  <MenuItem value={1}>Low</MenuItem>
                  <MenuItem value={2}>Medium</MenuItem>
                  <MenuItem value={3}>High</MenuItem>
                </TextField>
              ) : <RiskBadge level={row.RiskLevel} />}
            </Grid>

            <Grid item xs={12} sm={6}>
              <FL label="Target Date" />
              {ed ? (
                <TextField type="date" fullWidth size="small" value={row.TargetDate}
                  onChange={e => upd(row.id, "TargetDate", e.target.value)} InputLabelProps={{ shrink:true }} />
              ) : (
                <Stack direction="row" alignItems="center" spacing={.6}>
                  <CalendarIcon sx={{ fontSize:14, color:C.mute }} />
                  <Typography fontSize={13.5} color={C.mute}>{row.TargetDate || "—"}</Typography>
                </Stack>
              )}
            </Grid>

            <Grid item xs={12}>
              <FL label="Action Required" />
              {ed ? (
                <TextField fullWidth size="small" value={row.ActionReq}
                  onChange={e => upd(row.id, "ActionReq", e.target.value)}
                  placeholder="Describe required action…" multiline minRows={2} />
              ) : (
                <Typography fontSize={13.5} color={row.ActionReq ? C.txt : C.mute} fontStyle={row.ActionReq ? "normal" : "italic"}>
                  {row.ActionReq || "—"}
                </Typography>
              )}
            </Grid>

            <Grid item xs={12}>
              <FL label="Action By" />
              {ed ? (
                <TextField select fullWidth size="small" value={row.ActionBy}
                  onChange={e => upd(row.id, "ActionBy", e.target.value)}>
                  <MenuItem value=""><em>— Select Employee —</em></MenuItem>
                  {employees.map((e, i) => (
                    <MenuItem key={`emp-${e.iId}-${i}`} value={String(e.iId)}>
                      {e.sName} ({e.sCode})
                    </MenuItem>
                  ))}
                </TextField>
              ) : emp ? (
                <Box>
                  <Typography fontSize={13.5} fontWeight={700} color={C.txt}>{emp.sName}</Typography>
                  <Typography fontSize={11.5} color={C.mute}>{emp.sCode}</Typography>
                </Box>
              ) : <Typography fontSize={13.5} color={C.mute} fontStyle="italic">—</Typography>}
            </Grid>
          </Grid>

          <Stack direction="row" spacing={1} sx={{ mt:2, pt:2, borderTop:`1px solid ${C.bdr}` }}>
            {ed ? (
              <>
                <Button size="small" startIcon={<CheckIcon />} onClick={done}
                  sx={{ flex:1, bgcolor:C.lb, color:C.lc, border:`1px solid ${C.ld}`, fontWeight:700, "&:hover":{ bgcolor:C.ld } }}>
                  Confirm
                </Button>
                <Button size="small" startIcon={<CloseIcon />} onClick={() => cancel(row.id)}
                  sx={{ flex:1, bgcolor:C.hb, color:C.hc, border:`1px solid ${C.hd}`, fontWeight:700, "&:hover":{ bgcolor:C.hd } }}>
                  Cancel
                </Button>
              </>
            ) : (
              <>
                <Button size="small" startIcon={<EditIcon />} onClick={() => { setEditId(row.id); setExpanded(true); }}
                  sx={{ flex:1, bgcolor:C.mb, color:C.mc, border:`1px solid ${C.md}`, fontWeight:700, "&:hover":{ bgcolor:C.md } }}>
                  Edit
                </Button>
                <Button size="small" startIcon={<DeleteIcon />} onClick={() => setConfirmId(row.id)}
                  sx={{ flex:1, bgcolor:C.hb, color:C.hc, border:`1px solid ${C.hd}`, fontWeight:700, "&:hover":{ bgcolor:C.hd } }}>
                  Delete
                </Button>
              </>
            )}
          </Stack>
        </Box>
      </Collapse>
    </Paper>
  );
}

const safeParse = (data, fallback = []) => {
  try {
    const p = typeof data === "string" ? JSON.parse(data) : data;
    return Array.isArray(p) ? p : fallback;
  } catch { return fallback; }
};

const dedupeById = (arr) => {
  const seen = new Set();
  return arr.filter(item => {
    const k = String(item.iId);
    if (seen.has(k)) return false;
    seen.add(k); return true;
  });
};

const SS_KEY = "hse_form";
const readSS  = () => { try { return JSON.parse(sessionStorage.getItem(SS_KEY) || "{}"); } catch { return {}; } };
const writeSS = (d) => { try { sessionStorage.setItem(SS_KEY, JSON.stringify(d)); } catch {} };
const clearSS = ()  => { try { sessionStorage.removeItem(SS_KEY); } catch {} };

export default function ObservationPage({ onGoSummary }) {
  const navigate  = useNavigate();
  const muiTheme  = useTheme();
  const isMobile  = useMediaQuery(muiTheme.breakpoints.down("md"));

  const goSummary = () => { if (onGoSummary) onGoSummary(); else navigate("/summary"); };

  const [projects,  setProjects]  = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [loadError, setLoadError] = useState("");

  const [docDate,    setDocDate]    = useState(() => readSS().docDate    || today());
  const [project,    setProject]    = useState(() => readSS().project    || "");
  const [projectDes, setProjectDes] = useState(() => readSS().projectDes || "");
  const [location,   setLocation]   = useState(() => readSS().location   || "");
  const [userId]                    = useState(0);
  const [transId,    setTransId]    = useState(() => readSS().transId    || 0);
  const [rows,    setRows]    = useState(() => { const s = readSS().rows; return Array.isArray(s) ? s : []; });
  const [savedOk, setSavedOk] = useState(() => !!readSS().savedOk);
  const [editId,    setEditId]    = useState(null);
  const [confirmId, setConfirmId] = useState(null);
  const [saving,    setSaving]    = useState(false);
  const [snack,     setSnack]     = useState({ open:false, msg:"", sev:"success" });

  const toast = (msg, sev="success") => setSnack({ open:true, msg, sev });
  const mountedRef     = useRef(false);
  const skipPersistRef = useRef(false);

  useEffect(() => {
    if (!mountedRef.current) { mountedRef.current = true; return; }
    if (skipPersistRef.current) { skipPersistRef.current = false; return; }
    writeSS({ docDate, project, projectDes, location, transId, rows, savedOk });
  }, [docDate, project, projectDes, location, transId, rows, savedOk]);

  const loadMaster = useCallback(() => {
    setLoading(true); setLoadError("");
    const ft = (url, ms = 10000) => {
      const c = new AbortController();
      const t = setTimeout(() => c.abort(), ms);
      return fetch(url, { signal: c.signal }).finally(() => clearTimeout(t));
    };
    Promise.all([
      ft(`${API}/GetProject`).then(r => r.json()),
      ft(`${API}/GetEmployee`).then(r => r.json()),
    ])
    .then(([pd, ed]) => {
      if (pd.Status === "Success") setProjects(dedupeById(safeParse(pd.ResultData, [])));
      if (ed.Status === "Success") setEmployees(dedupeById(safeParse(ed.ResultData, [])));
    })
    .catch(err => {
      const msg = err.name === "AbortError" ? "Request timed out." : `Load error: ${err.message}`;
      setLoadError(msg); toast(msg, "error");
    })
    .finally(() => setLoading(false));
  }, []);

  useEffect(() => { loadMaster(); }, [loadMaster]);

  const prevProjRef = useRef(null);
  useEffect(() => {
    if (!project) { setProjectDes(""); prevProjRef.current = null; return; }
    if (project === prevProjRef.current) return;
    prevProjRef.current = project;
    fetch(`${API}/GetProjectDescription?iProject=${project}`).then(r => r.json())
      .then(d => {
        if (d.Status === "Success") {
          const r = safeParse(d.ResultData, []);
          setProjectDes(r[0]?.sDescription || "");
        }
      }).catch(() => {});
  }, [project]);

  const addRow = () => {
    const r = { id:Date.now(), iTransDtId:0, Observation:"", RiskLevel:2, ActionReq:"", ActionBy:"", TargetDate:today(), _unsaved:true };
    if (savedOk) {
      skipPersistRef.current = true;
      const freshDate = today();
      const updatedRows = [...rows, r];
      const freshSnap = { docDate:freshDate, project:"", projectDes:"", location:"", transId:0, rows:updatedRows, savedOk:false };
      clearSS(); writeSS(freshSnap);
      setDocDate(freshDate); setProject(""); setProjectDes(""); setLocation(""); setTransId(0);
      setSavedOk(false); setRows(() => updatedRows); prevProjRef.current = null;
    } else {
      setRows(prev => [...prev, r]);
    }
    setEditId(r.id);
  };

  const upd    = (id, f, v) => setRows(prev => prev.map(r => r.id === id ? { ...r, [f]:v } : r));
  const done   = () => setEditId(null);
  const cancel = id => {
    setEditId(null);
    setRows(prev => {
      const r = prev.find(x => x.id === id);
      return r?._unsaved && !r.Observation.trim() ? prev.filter(x => x.id !== id) : prev;
    });
  };
  const del = () => {
    setRows(prev => {
      const next = prev.filter(r => r.id !== confirmId);
      if (next.length === 0) setSavedOk(false);
      return next;
    });
    if (editId === confirmId) setEditId(null);
    setConfirmId(null);
  };
  const empById = id => employees.find(e => String(e.iId) === String(id));
  const startNew = () => {
    clearSS();
    setDocDate(today()); setProject(""); setProjectDes("");
    setLocation(""); setTransId(0); setRows([]); setSavedOk(false);
    setEditId(null); prevProjRef.current = null;
  };

  const save = async () => {
    if (!project)      { toast("Please select a Project.", "error");          return; }
    if (!location)     { toast("Please enter Location.", "error");            return; }
    if (!rows.length)  { toast("Add at least one observation.", "error");    return; }
    if (editId != null){ toast("Please confirm the open row first.", "warning"); return; }

    setSaving(true);
    const payload = {
      iTransId:0, DocDate:docDate,
      Project:Number(project), ProjectDes:projectDes,
      Location:location, UserId:userId, Signature:"",
      Body: rows.map(r => ({
        Observation:r.Observation, RiskLevel:Number(r.RiskLevel),
        ActionReq:r.ActionReq, ActionBy:Number(r.ActionBy) || 0,
        TargetDate:r.TargetDate, Images:"",
      })),
    };
    try {
      const fd = new FormData();
      fd.append("data", JSON.stringify(payload));
      const res    = await fetch(SAVE_API, { method:"POST", body:fd });
      const result = await res.json();
      if (result.Status === "Success") {
        const newTransId = Number(result.ResultData) || transId;
        const savedRows  = rows.map(r => ({ ...r, _unsaved:false }));
        setTransId(newTransId); setRows(savedRows); setSavedOk(true);
        writeSS({ docDate, project, projectDes, location, transId:newTransId, rows:savedRows, savedOk:true });
        toast(`Saved! Trans #${newTransId}`);
      } else {
        toast(result.MessageDescription || "Operation failed.", "error");
      }
    } catch(err) {
      toast(`Request failed: ${err.message}`, "error");
    }
    setSaving(false);
  };

  return (
    <ThemeProvider theme={theme}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');`}</style>
      <Box sx={{ minHeight:"100vh", bgcolor:C.bg }}>

        {/* ── Top Nav ── */}
        <Box sx={{ background:`linear-gradient(135deg,${C.p} 0%,${C.pDk} 100%)`, boxShadow:`0 3px 16px ${C.shad}`, position:"sticky", top:0, zIndex:300 }}>
          <GreenBar h={3} />
          <Container maxWidth="xl">
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ height:{ xs:56, sm:62 }, px:{ xs:0, sm:0 } }}>
              <Stack direction="row" alignItems="center" spacing={1.2}>
                <Box sx={{ width:{ xs:36, sm:42 }, height:{ xs:36, sm:42 }, borderRadius:"11px", bgcolor:alpha("#fff",.2), border:`1.5px solid ${alpha("#fff",.4)}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <SafetyIcon sx={{ color:"#fff", fontSize:{ xs:20, sm:24 } }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight:900, color:"#fff", fontSize:{ xs:13, sm:15.5 }, lineHeight:1.2 }}>HSE Observation System</Typography>
                  {!isMobile && <Typography sx={{ fontSize:9.5, color:alpha("#fff",.8), letterSpacing:".12em", fontWeight:700 }}>HEALTH · SAFETY · ENVIRONMENT</Typography>}
                </Box>
              </Stack>
              <Stack direction="row" spacing={.5} alignItems="center">
                {!isMobile && (
                  <Box sx={{ px:2.2, py:.85, bgcolor:alpha("#fff",.2), border:`1.5px solid ${alpha("#fff",.45)}`, borderRadius:"8px", display:"flex", alignItems:"center", gap:.8 }}>
                    <Box sx={{ width:7, height:7, borderRadius:"50%", bgcolor:"#fff" }} />
                    <Typography sx={{ color:"#fff", fontWeight:800, fontSize:13.5 }}>Observation Form</Typography>
                  </Box>
                )}
                <Button onClick={goSummary} size={isMobile ? "small" : "medium"}
                  sx={{ color:alpha("#fff",.9), fontWeight:700, fontSize:{ xs:12, sm:13.5 }, border:"1.5px solid transparent", borderRadius:"8px", px:{ xs:1.5, sm:2 }, "&:hover":{ bgcolor:alpha("#fff",.12), borderColor:alpha("#fff",.35), color:"#fff" } }}>
                  {isMobile ? "Summary" : "View Summary"}
                </Button>
              </Stack>
            </Stack>
          </Container>
        </Box>

        <Container maxWidth="xl" sx={{ py:{ xs:2, sm:3.5 }, px:{ xs:1.5, sm:3 } }}>

          {/* ── Banner ── */}
          <Paper elevation={0} sx={{ mb:3, overflow:"hidden", border:`1.5px solid ${C.bdr}`, boxShadow:`0 2px 12px ${C.shad}` }}>
            <GreenBar />
            <Box sx={{ p:{ xs:"14px 16px", sm:"20px 28px" }, background:"#fff", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:1.5 }}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box sx={{ width:{ xs:40, sm:52 }, height:{ xs:40, sm:52 }, borderRadius:"13px", bgcolor:C.pLt, border:`1.5px solid ${C.bdrM}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                  <SafetyIcon sx={{ color:C.p, fontSize:{ xs:22, sm:28 } }} />
                </Box>
                <Box>
                  <Typography sx={{ fontWeight:900, fontSize:{ xs:15, sm:19 }, color:C.txt, lineHeight:1.2 }}>
                    {savedOk ? "HSE Observation" : "New HSE Observation"}
                  </Typography>
                  <Typography sx={{ fontSize:{ xs:11.5, sm:13 }, color:C.mute, mt:.3 }}>
                    {savedOk
                      ? `Trans #${transId} · ${rows.length} row${rows.length!==1?"s":""} saved.`
                      : "Select project · fill header · add observations · save."}
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
                {transId > 0 && <Chip label={`Trans #${transId}`} size="small" sx={{ bgcolor:C.pLt, color:C.txt, fontWeight:700, border:`1px solid ${C.bdrM}` }} />}
                {savedOk && (
                  <Button variant="outlined" size="small" startIcon={<RefreshIcon />} onClick={startNew}
                    sx={{ borderColor:C.bdrM, color:C.p, fontWeight:700, "&:hover":{ bgcolor:C.pLt, borderColor:C.p } }}>
                    New Form
                  </Button>
                )}
              </Stack>
            </Box>
          </Paper>

          {loading ? (
            <Box sx={{ textAlign:"center", py:12 }}>
              <CircularProgress sx={{ color:C.p }} size={52} thickness={4} />
              <Typography sx={{ mt:2.5, color:C.mute, fontWeight:700, fontSize:14 }}>Loading master data…</Typography>
            </Box>
          ) : (
            <>
              {loadError && (
                <Alert severity="error" sx={{ mb:2.5, borderRadius:"10px", fontWeight:600 }}
                  action={<Button size="small" onClick={loadMaster} color="error" sx={{ fontWeight:700 }}>Retry</Button>}>
                  {loadError}
                </Alert>
              )}

              {/* ── Header Card ── */}
              <Card icon={<FolderIcon sx={{ color:C.p, fontSize:19 }} />} title="Header Information">
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={4} lg={2}>
                    <FL label="Document Date" />
                    <TextField fullWidth type="date" size="small" value={docDate}
                      onChange={e => setDocDate(e.target.value)}
                      InputProps={{ readOnly:savedOk }} sx={savedOk ? RO : {}} InputLabelProps={{ shrink:true }} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={2.5}>
                    <FL label="Project" req />
                    <FormControl fullWidth size="small">
                      <Select value={project} onChange={e => setProject(e.target.value)} displayEmpty disabled={savedOk}>
                        <MenuItem value=""><em style={{ color:C.mute }}>— Select Project —</em></MenuItem>
                        {projects.map((p, idx) => (
                          <MenuItem key={`project-${p.iId}-${idx}`} value={p.iId}>{p.sName}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={3}>
                    <FL label="Project Description" />
                    <TextField fullWidth size="small" value={projectDes} InputProps={{ readOnly:true }}
                      placeholder="Auto-filled on project select" sx={RO} />
                  </Grid>
                  <Grid item xs={12} sm={6} md={4} lg={2.5}>
                    <FL label="Location" req />
                    <TextField fullWidth size="small" value={location} onChange={e => setLocation(e.target.value)}
                      placeholder="Enter site / location"
                      InputProps={{ readOnly:savedOk, startAdornment:<LocationIcon sx={{ mr:.8, color:C.p, fontSize:18 }} /> }}
                      sx={savedOk ? RO : {}} />
                  </Grid>
                  <Grid item xs={6} sm={3} md={2} lg={1}>
                    <FL label="User ID" />
                    <TextField fullWidth size="small" value={userId} InputProps={{ readOnly:true }} sx={RO} />
                  </Grid>
                </Grid>
              </Card>

              {/* ── Observations Card ── */}
              <Card
                icon={<ListAltIcon sx={{ color:C.p, fontSize:19 }} />}
                title="General Conditions"
                action={
                  <Button size="small" startIcon={<AddIcon />} onClick={addRow} sx={{
                    bgcolor:C.p, color:"#fff", fontWeight:700, fontSize:{ xs:12, sm:13 },
                    border:`1.5px solid ${C.pDk}`, "&:hover":{ bgcolor:C.pDk },
                    boxShadow:`0 2px 8px ${alpha(C.p,.3)}`,
                    px:{ xs:1.5, sm:2 },
                  }}>
                    {isMobile ? "Add" : "Add Row"}
                  </Button>
                }>

                {/* MOBILE: Card layout */}
                {isMobile ? (
                  <Box>
                    {rows.length === 0 ? (
                      <Box sx={{ textAlign:"center", py:6 }}>
                        <Stack alignItems="center" spacing={1.2}>
                          <Box sx={{ width:56, height:56, borderRadius:"50%", bgcolor:C.pLt, border:`1.5px solid ${C.bdrM}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <ListAltIcon sx={{ color:C.p, fontSize:28 }} />
                          </Box>
                          <Typography fontSize={13.5} color={C.mute} fontWeight={600} textAlign="center">
                            No observations yet — tap <strong style={{ color:C.p }}>Add</strong> to begin.
                          </Typography>
                        </Stack>
                      </Box>
                    ) : (
                      rows.map((row, idx) => (
                        <MobileRowCard
                          key={row.id}
                          row={row} idx={idx}
                          ed={editId === row.id}
                          editId={editId}
                          employees={employees}
                          empById={empById}
                          upd={upd} done={done} cancel={cancel}
                          setEditId={setEditId}
                          setConfirmId={setConfirmId}
                        />
                      ))
                    )}
                  </Box>
                ) : (
                  /* DESKTOP: Table layout */
                  <TableContainer sx={{ borderRadius:"10px", border:`1.5px solid ${C.bdr}`, overflow:"hidden" }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ width:92 }}>Action</TableCell>
                          <TableCell>Observation</TableCell>
                          <TableCell sx={{ width:118 }}>Risk Level</TableCell>
                          <TableCell>Action Required</TableCell>
                          <TableCell>Action By</TableCell>
                          <TableCell sx={{ width:132 }}>Target Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {rows.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} align="center" sx={{ py:8, bgcolor:"#fff" }}>
                              <Stack alignItems="center" spacing={1.2}>
                                <Box sx={{ width:56, height:56, borderRadius:"50%", bgcolor:C.pLt, border:`1.5px solid ${C.bdrM}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                                  <ListAltIcon sx={{ color:C.p, fontSize:28 }} />
                                </Box>
                                <Typography fontSize={13.5} color={C.mute} fontWeight={600}>
                                  No observations yet — click <strong style={{ color:C.p }}>Add Row</strong> to begin.
                                </Typography>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        )}
                        {rows.map((row, idx) => {
                          const ed  = editId === row.id;
                          const emp = empById(row.ActionBy);
                          return (
                            <TableRow key={row.id} sx={{
                              bgcolor: ed ? alpha(C.p,.04) : idx % 2 === 0 ? "#fff" : C.sAlt,
                              borderLeft:`3px solid ${ed ? C.p : row._unsaved ? C.md : C.s}`,
                              transition:"all .14s",
                              "&:hover td":{ bgcolor:!ed ? alpha(C.p,.025) : undefined },
                            }}>
                              <TableCell>
                                <Stack direction="row" spacing={.6}>
                                  {ed ? (
                                    <>
                                      <IBtn tip="Confirm" onClick={done} c={C.lc} bg={C.lb} bd={C.ld} icon={<CheckIcon sx={{ fontSize:15 }} />} />
                                      <IBtn tip="Cancel"  onClick={() => cancel(row.id)} c={C.hc} bg={C.hb} bd={C.hd} icon={<CloseIcon sx={{ fontSize:15 }} />} />
                                    </>
                                  ) : (
                                    <>
                                      <IBtn tip="Edit row"   onClick={() => setEditId(row.id)}    c={C.mc} bg={C.mb} bd={C.md} icon={<EditIcon sx={{ fontSize:15 }} />} />
                                      <IBtn tip="Delete row" onClick={() => setConfirmId(row.id)} c={C.hc} bg={C.hb} bd={C.hd} icon={<DeleteIcon sx={{ fontSize:15 }} />} />
                                    </>
                                  )}
                                </Stack>
                              </TableCell>
                              <TableCell sx={{ minWidth:200 }}>
                                {ed ? (
                                  <TextField fullWidth size="small" autoFocus value={row.Observation}
                                    onChange={e => upd(row.id, "Observation", e.target.value)}
                                    placeholder="Describe the observation…" />
                                ) : (
                                  <Typography fontSize={13.5} color={row.Observation ? C.txt : C.mute} fontStyle={row.Observation ? "normal" : "italic"}>
                                    {row.Observation || "—"}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell>
                                {ed ? (
                                  <TextField select fullWidth size="small" value={row.RiskLevel}
                                    onChange={e => upd(row.id, "RiskLevel", Number(e.target.value))}>
                                    <MenuItem value={1}>Low</MenuItem>
                                    <MenuItem value={2}>Medium</MenuItem>
                                    <MenuItem value={3}>High</MenuItem>
                                  </TextField>
                                ) : <RiskBadge level={row.RiskLevel} />}
                              </TableCell>
                              <TableCell sx={{ minWidth:170 }}>
                                {ed ? (
                                  <TextField fullWidth size="small" value={row.ActionReq}
                                    onChange={e => upd(row.id, "ActionReq", e.target.value)}
                                    placeholder="Describe required action…" />
                                ) : (
                                  <Typography fontSize={13.5} color={row.ActionReq ? C.txt : C.mute} fontStyle={row.ActionReq ? "normal" : "italic"}>
                                    {row.ActionReq || "—"}
                                  </Typography>
                                )}
                              </TableCell>
                              <TableCell sx={{ minWidth:200 }}>
                                {ed ? (
                                  <TextField select fullWidth size="small" value={row.ActionBy}
                                    onChange={e => upd(row.id, "ActionBy", e.target.value)}>
                                    <MenuItem value=""><em>— Select Employee —</em></MenuItem>
                                    {employees.map((e, i) => (
                                      <MenuItem key={`emp-${e.iId}-${i}`} value={String(e.iId)}>
                                        {e.sName} ({e.sCode})
                                      </MenuItem>
                                    ))}
                                  </TextField>
                                ) : emp ? (
                                  <Box>
                                    <Typography fontSize={13.5} fontWeight={700} color={C.txt}>{emp.sName}</Typography>
                                    <Typography fontSize={11.5} color={C.mute}>{emp.sCode}</Typography>
                                  </Box>
                                ) : <Typography fontSize={13.5} color={C.mute} fontStyle="italic">—</Typography>}
                              </TableCell>
                              <TableCell>
                                {ed ? (
                                  <TextField type="date" fullWidth size="small" value={row.TargetDate}
                                    onChange={e => upd(row.id, "TargetDate", e.target.value)} InputLabelProps={{ shrink:true }} />
                                ) : (
                                  <Stack direction="row" alignItems="center" spacing={.6}>
                                    <CalendarIcon sx={{ fontSize:14, color:C.mute }} />
                                    <Typography fontSize={13.5} color={C.mute}>{row.TargetDate || "—"}</Typography>
                                  </Stack>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}

                <Stack direction="row" justifyContent="space-between" sx={{ mt:1.5 }}>
                  <Typography variant="caption" sx={{ color:C.mute, fontSize:12 }}>
                    {rows.length} row{rows.length!==1?"s":""} · {rows.filter(r => r.Observation?.trim()).length} with observation
                    {editId != null && <Box component="span" sx={{ ml:1.5, color:"#E65100", fontWeight:700 }}>⚠ Confirm open row before saving</Box>}
                  </Typography>
                  <Typography variant="caption" sx={{ color:C.mute, fontSize:11.5 }}>User ID: {userId}</Typography>
                </Stack>

                <Divider sx={{ my:2.5, borderColor:C.bdr }} />
                <Stack direction="row" justifyContent="flex-end" spacing={1.5}>
                  {onGoSummary && (
                    <Button variant="outlined" onClick={goSummary}
                      sx={{ borderColor:C.bdrM, color:C.p, "&:hover":{ borderColor:C.p, bgcolor:C.pLt } }}>
                      View Summary
                    </Button>
                  )}
                  <Button variant="contained" size="large" onClick={save} disabled={saving}
                    fullWidth={isMobile}
                    startIcon={saving ? <CircularProgress size={18} color="inherit" /> : <SaveIcon />}
                    sx={{
                      px:{ xs:3, sm:5 }, fontWeight:800, fontSize:{ xs:13.5, sm:14.5 },
                      background:`linear-gradient(135deg,${C.s} 0%,${C.p} 100%)`,
                      color:"#fff", boxShadow:`0 4px 16px ${alpha(C.p,.3)}`,
                      "&:hover":{ background:`linear-gradient(135deg,${C.p} 0%,${C.pDk} 100%)`, boxShadow:`0 6px 22px ${alpha(C.p,.4)}` },
                      "&:disabled":{ background:C.bdr, boxShadow:"none" },
                    }}>
                    {saving ? "Saving…" : "Save Observation"}
                  </Button>
                </Stack>
              </Card>
            </>
          )}
        </Container>

        {/* ── Delete Dialog ── */}
        <Dialog open={!!confirmId} onClose={() => setConfirmId(null)} TransitionComponent={Fade}
          fullWidth maxWidth="xs"
          PaperProps={{ sx:{ overflow:"hidden", border:`1.5px solid ${C.bdr}`, mx:{ xs:2, sm:"auto" } } }}>
          <GreenBar />
          <Box sx={{ textAlign:"center", pt:3.5, pb:.5 }}>
            <Box sx={{ width:64, height:64, borderRadius:"50%", mx:"auto", bgcolor:C.hb, border:`1.5px solid ${C.hd}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <DeleteIcon sx={{ color:C.hc, fontSize:32 }} />
            </Box>
          </Box>
          <DialogTitle sx={{ textAlign:"center", fontWeight:900, fontSize:18, color:C.txt, pt:1.5 }}>Delete this observation?</DialogTitle>
          <DialogContent sx={{ pt:.5 }}>
            <DialogContentText textAlign="center" sx={{ color:C.mute, fontSize:13.5 }}>
              This row will be removed from the local form. The server record is preserved in the summary.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={{ justifyContent:"center", pb:3, gap:1.5, flexDirection:{ xs:"column", sm:"row" }, px:3 }}>
            <Button variant="outlined" fullWidth={isMobile} onClick={() => setConfirmId(null)}
              sx={{ borderColor:C.bdrM, color:C.p, minWidth:100, "&:hover":{ borderColor:C.p, bgcolor:C.pLt } }}>Cancel</Button>
            <Button variant="contained" fullWidth={isMobile} onClick={del} startIcon={<DeleteIcon />}
              sx={{ bgcolor:"#C62828", minWidth:140, fontWeight:800, boxShadow:`0 4px 12px ${alpha("#C62828",.3)}`, "&:hover":{ bgcolor:"#9B1313" } }}>
              Yes, Delete
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── Snackbar ── */}
        <Snackbar open={snack.open} autoHideDuration={4000} onClose={() => setSnack(s => ({ ...s, open:false }))}
          anchorOrigin={{ vertical:"bottom", horizontal:isMobile ? "center" : "right" }}>
          <Alert onClose={() => setSnack(s => ({ ...s, open:false }))} severity={snack.sev} variant="filled"
            sx={{
              fontWeight:700, borderRadius:"10px", fontSize:13.5,
              width:{ xs:"90vw", sm:"auto" },
              ...(snack.sev==="success" && { background:`linear-gradient(135deg,${C.s},${C.p})`, boxShadow:`0 6px 20px ${alpha(C.p,.4)}` }),
            }}>
            {snack.msg}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  );
}