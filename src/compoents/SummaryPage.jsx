import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {Box, Container, Typography, Paper, Table, TableBody, TableCell,TableContainer, TableHead, TableRow, IconButton,CircularProgress, Stack, Dialog, DialogActions,Button, Chip, Grid, Snackbar, Alert, Divider,} from "@mui/material";
import {HealthAndSafety as SafetyIcon,Visibility as ViewIcon,ListAlt as ListAltIcon,ArrowBack as ArrowBackIcon,Refresh as RefreshIcon,CalendarToday as CalendarIcon,LocationOn as LocationIcon,FolderOpen as FolderIcon,Person as PersonIcon,Assignment as AssignIcon,} from "@mui/icons-material";
import { createTheme, ThemeProvider, alpha } from "@mui/material/styles";

const C = {
  p:"#43A047", s:"#81C784", bg:"#F9FBF9", txt:"#2E7D32", pDk:"#388E3C", pLt:"#E8F5E9",
  bdr:"#C8E6C9", bdrM:"#A5D6A7", mute:"#66A96A", surf:"#FFFFFF", sAlt:"#F9FBF9",
  shad:"rgba(67,160,71,0.10)",
  lc:"#2E7D32", lb:"#E8F5E9", ld:"#A5D6A7", ldot:"#4CAF50",
  mc:"#E65100", mb:"#FFF3E0", md:"#FFCC80",
  hc:"#C62828", hb:"#FFEBEE", hd:"#EF9A9A", hdot:"#EF5350",
};

const theme = createTheme({
  palette:{
    primary:{main:C.p, light:C.s, dark:C.pDk, contrastText:"#fff"},
    background:{default:C.bg, paper:C.surf},
    text:{primary:C.txt, secondary:C.mute},
  },
  typography:{fontFamily:"'Nunito','Segoe UI',system-ui,sans-serif"},
  shape:{borderRadius:10},
  components:{
    MuiPaper:{styleOverrides:{root:{backgroundImage:"none"}}},
    MuiButton:{styleOverrides:{root:{borderRadius:8, textTransform:"none", fontWeight:700}}},
    MuiTableCell:{
      styleOverrides:{
        head:{
          background:C.p, color:"#fff", fontWeight:700, fontSize:11.5,
          textTransform:"uppercase", letterSpacing:".07em", padding:"13px 16px",
          borderRight:`1px solid ${alpha("#fff",.18)}`, borderBottom:"none",
        },
        body:{fontSize:13.5, padding:"11px 16px", color:C.txt, borderBottom:`1px solid ${C.bdr}`},
      },
    },
  },
});

const API = "/api";

const RISK = {
  1:{label:"Low",    c:C.lc, bg:C.lb, bd:C.ld, dot:C.ldot},
  2:{label:"Medium", c:C.mc, bg:C.mb, bd:C.md, dot:"#FFA726"},
  3:{label:"High",   c:C.hc, bg:C.hb, bd:C.hd, dot:C.hdot},
};

const GreenBar = ({h=4}) => (
  <Box sx={{height:h, background:`linear-gradient(90deg,${C.s} 0%,${C.p} 60%,${C.pDk} 100%)`}}/>
);

function SectionCard({icon, title, children, action}) {
  return (
    <Paper elevation={0} sx={{mb:3, overflow:"hidden", border:`1.5px solid ${C.bdr}`, boxShadow:`0 2px 14px ${C.shad}`}}>
      <GreenBar/>
      <Box sx={{px:3, py:2, background:C.pLt, borderBottom:`1.5px solid ${C.bdrM}`,
        display:"flex", alignItems:"center", justifyContent:"space-between"}}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{width:34, height:34, borderRadius:"8px", bgcolor:alpha(C.p,.15),
            border:`1.5px solid ${C.bdrM}`, display:"flex", alignItems:"center", justifyContent:"center"}}>
            {icon}
          </Box>
          <Typography sx={{fontWeight:800, fontSize:15, color:C.txt}}>{title}</Typography>
        </Stack>
        {action}
      </Box>
      <Box sx={{p:3, bgcolor:"#FFFFFF"}}>{children}</Box>
    </Paper>
  );
}

function RiskBadge({level}) {
  const r = RISK[level] || RISK[2];
  return (
    <Box sx={{display:"inline-flex", alignItems:"center", gap:.7, px:1.3, py:.5,
      borderRadius:"6px", bgcolor:r.bg, border:`1px solid ${r.bd}`}}>
      <Box sx={{width:8, height:8, borderRadius:"50%", bgcolor:r.dot}}/>
      <Typography fontSize={12} fontWeight={700} color={r.c}>{r.label}</Typography>
    </Box>
  );
}

function InfoChip({icon, label, value}) {
  return (
    <Box sx={{display:"flex", alignItems:"flex-start", gap:1, p:1.5,
      borderRadius:"8px", bgcolor:C.pLt, border:`1px solid ${C.bdrM}`}}>
      <Box sx={{color:C.p, mt:.2, flexShrink:0}}>{icon}</Box>
      <Box>
        <Typography fontSize={10} fontWeight={700} color={C.mute}
          textTransform="uppercase" letterSpacing=".07em">{label}</Typography>
        <Typography fontSize={13.5} fontWeight={700} color={C.txt}>{value || "—"}</Typography>
      </Box>
    </Box>
  );
}

export default function SummaryPage({ onGoForm }) {
  const navigate = useNavigate();
  const goForm = () => { if (onGoForm) onGoForm(); else navigate("/"); };

  const [summaries,     setSummaries]     = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [detail,        setDetail]        = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedTrans, setSelectedTrans] = useState(null);
  const [lastFetched,   setLastFetched]   = useState(null);
  const [snack, setSnack] = useState({open:false, msg:"", sev:"error"});
  const toast = (msg, sev="error") => setSnack({open:true, msg, sev});
  const fetchAll = useCallback(() => {
    setLoading(true);
    fetch(`${API}/GetHSESummary?UserId=0`, {
      cache: "no-store",
      headers: { "Cache-Control": "no-cache", "Pragma": "no-cache" },
    })
      .then(r => r.json())
      .then(d => {
        console.group(" GetHSESummary");
        console.log("Status  :", d.Status);
        if (d.Status === "Success") {
          const list = JSON.parse(d.ResultData || "[]");
          list.sort((a, b) => Number(b.iTransId) - Number(a.iTransId));
          console.log("Records :", list.length, "— Latest TransId:", list[0]?.iTransId);
          console.groupEnd();
          setSummaries(list);
          setLastFetched(new Date().toLocaleTimeString());
        } else {
          console.warn("Non-success:", d);
          console.groupEnd();
          toast(d.MessageDescription || "Failed to load summary.");
        }
      })
      .catch(err => {
        console.error("Summary fetch error:", err);
        toast("Network error loading summary.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);
  const openDetail = (transId) => {
    setSelectedTrans(transId);
    setDetailLoading(true);
    setDetail(null);
    fetch(`${API}/GetHSEDetails?iTransId=${transId}`)
      .then(r => r.json())
      .then(d => {
        console.group(`GetHSEDetails — Trans #${transId}`);
        console.log("Raw API response :", d);

        if (d.Status === "Success") {
          let parsed = {};
          try {
            const rd = d.ResultData;
            parsed = typeof rd === "string" ? JSON.parse(rd) : rd;
          } catch (e) {
            console.error("ResultData parse error:", e);
          }

          console.log("Parsed Header :", parsed.Header);
          console.log("Parsed Body   :", parsed.Body);
          console.groupEnd();

          setDetail({
            header: parsed.Header?.[0] || {},
            body:   Array.isArray(parsed.Body) ? parsed.Body : [],
          });
        } else {
          console.warn("API returned non-success:", d);
          console.groupEnd();
          toast("Failed to load details.");
        }
      })
      .catch(err => {
        console.error("Detail fetch error:", err);
        toast("Network error loading details.");
      })
      .finally(() => setDetailLoading(false));
  };

  const closeDetail = () => { setSelectedTrans(null); setDetail(null); };
  return (
    <ThemeProvider theme={theme}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');`}</style>
      <Box sx={{minHeight:"100vh", bgcolor:C.bg}}>
        <Box sx={{background:`linear-gradient(135deg,${C.p} 0%,${C.pDk} 100%)`,
          boxShadow:`0 3px 16px ${C.shad}`, position:"sticky", top:0, zIndex:300}}>
          <GreenBar h={3}/>
          <Container maxWidth="xl">
            <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{height:62}}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box sx={{width:42, height:42, borderRadius:"11px", bgcolor:alpha("#fff",.2),
                  border:`1.5px solid ${alpha("#fff",.4)}`, display:"flex", alignItems:"center", justifyContent:"center"}}>
                  <SafetyIcon sx={{color:"#fff", fontSize:24}}/>
                </Box>
                <Box>
                  <Typography sx={{fontWeight:900, color:"#fff", fontSize:15.5, lineHeight:1.2}}>HSE Observation System</Typography>
                  <Typography sx={{fontSize:9.5, color:alpha("#fff",.8), letterSpacing:".12em", fontWeight:700}}>HEALTH · SAFETY · ENVIRONMENT</Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={.5} alignItems="center">
                <Box sx={{px:2.2, py:.85, bgcolor:alpha("#fff",.2), border:`1.5px solid ${alpha("#fff",.45)}`,
                  borderRadius:"8px", display:"flex", alignItems:"center", gap:.8}}>
                  <Box sx={{width:7, height:7, borderRadius:"50%", bgcolor:"#fff"}}/>
                  <Typography sx={{color:"#fff", fontWeight:800, fontSize:13.5}}>Summary</Typography>
                </Box>
                <Button onClick={goForm} sx={{color:alpha("#fff",.8), fontWeight:700, fontSize:13.5,
                  border:"1.5px solid transparent", borderRadius:"8px",
                  "&:hover":{bgcolor:alpha("#fff",.12), borderColor:alpha("#fff",.35), color:"#fff"}}}>
                  Observation Form
                </Button>
              </Stack>
            </Stack>
          </Container>
        </Box>

        <Container maxWidth="xl" sx={{py:3.5}}>
          <Paper elevation={0} sx={{mb:3, overflow:"hidden", border:`1.5px solid ${C.bdr}`, boxShadow:`0 2px 12px ${C.shad}`}}>
            <GreenBar/>
            <Box sx={{p:"20px 28px", background:"#fff", display:"flex",
              justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:2}}>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{width:52, height:52, borderRadius:"13px", bgcolor:C.pLt,
                  border:`1.5px solid ${C.bdrM}`, display:"flex", alignItems:"center", justifyContent:"center"}}>
                  <ListAltIcon sx={{color:C.p, fontSize:28}}/>
                </Box>
                <Box>
                  <Typography sx={{fontWeight:900, fontSize:19, color:C.txt, lineHeight:1.2}}>Observations Overview</Typography>
                  <Typography sx={{fontSize:13, color:C.mute, mt:.4}}>
                    {loading ? "Syncing with server…" : `${summaries.length} records · Last updated: ${lastFetched}`}
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1.5}>
                <IconButton onClick={fetchAll} disabled={loading}
                  sx={{border:`1.5px solid ${C.bdrM}`, color:C.p, borderRadius:"8px",
                    "&:hover":{bgcolor:C.pLt}}}>
                  {loading ? <CircularProgress size={20} sx={{color:C.p}}/> : <RefreshIcon/>}
                </IconButton>
                <Button variant="contained" onClick={goForm} startIcon={<ArrowBackIcon/>}
                  sx={{background:`linear-gradient(135deg,${C.s} 0%,${C.p} 100%)`,
                    boxShadow:`0 4px 12px ${alpha(C.p,.3)}`,
                    "&:hover":{background:`linear-gradient(135deg,${C.p} 0%,${C.pDk} 100%)`}}}>
                  New Observation
                </Button>
              </Stack>
            </Box>
          </Paper>
          <SectionCard icon={<ListAltIcon sx={{color:C.p, fontSize:19}}/>} title="Record History">
            {loading ? (
              <Box sx={{textAlign:"center", py:10}}>
                <CircularProgress sx={{color:C.p}} size={48} thickness={4}/>
                <Typography sx={{mt:2, color:C.mute, fontWeight:700}}>Loading records…</Typography>
              </Box>
            ) : summaries.length === 0 ? (
              <Box sx={{textAlign:"center", py:10}}>
                <Typography fontSize={14} color={C.mute} fontWeight={600}>No records found.</Typography>
              </Box>
            ) : (
              <TableContainer sx={{borderRadius:"10px", border:`1.5px solid ${C.bdr}`, overflow:"hidden"}}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{width:80}}>ID</TableCell>
                      <TableCell>Doc No</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Project</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell align="center" sx={{width:80}}>View</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {summaries.map((row, idx) => (
                      <TableRow key={row.iTransId} sx={{
                        bgcolor: idx === 0 ? alpha(C.p,.05) : idx % 2 === 0 ? "#fff" : C.sAlt,
                        "&:hover td":{bgcolor:alpha(C.p,.04)},
                        transition:"background .12s",
                      }}>
                        <TableCell>
                          <Stack direction="row" spacing={.8} alignItems="center">
                            {idx === 0 && (
                              <Chip label="NEW" size="small" sx={{
                                height:17, fontSize:9, fontWeight:800,
                                bgcolor:C.p, color:"#fff", borderRadius:"4px",
                              }}/>
                            )}
                            <Typography fontWeight={700} fontSize={13.5}>{row.iTransId}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell sx={{fontWeight:600, color:C.p}}>{row.sDocNo}</TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={.6}>
                            <CalendarIcon sx={{fontSize:13, color:C.mute}}/>
                            <Typography fontSize={13.5}>{row.Date}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={.6}>
                            <FolderIcon sx={{fontSize:13, color:C.mute}}/>
                            <Typography fontSize={13.5} fontWeight={600}>{row.Project}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={.6}>
                            <LocationIcon sx={{fontSize:13, color:C.mute}}/>
                            <Typography fontSize={13.5}>{row.sLocation}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell align="center">
                          <IconButton size="small" onClick={() => openDetail(row.iTransId)} sx={{
                            color:C.p, bgcolor:C.pLt, border:`1.5px solid ${C.bdrM}`,
                            borderRadius:"7px", transition:"all .14s",
                            "&:hover":{transform:"scale(1.1)", bgcolor:C.bdrM},
                          }}>
                            <ViewIcon sx={{fontSize:16}}/>
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </SectionCard>
        </Container>
        <Dialog open={!!selectedTrans} onClose={closeDetail} maxWidth="md" fullWidth
          PaperProps={{sx:{overflow:"hidden", border:`1.5px solid ${C.bdr}`}}}>
          <GreenBar/>

          <Box sx={{px:3, py:2, background:C.pLt, borderBottom:`1.5px solid ${C.bdrM}`,
            display:"flex", alignItems:"center", justifyContent:"space-between"}}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{width:34, height:34, borderRadius:"8px", bgcolor:alpha(C.p,.15),
                border:`1.5px solid ${C.bdrM}`, display:"flex", alignItems:"center", justifyContent:"center"}}>
                <AssignIcon sx={{color:C.p, fontSize:19}}/>
              </Box>
              <Box>
                <Typography fontWeight={800} fontSize={15} color={C.txt}>Observation Details</Typography>
                {detail?.header?.sDocNo && (
                  <Typography fontSize={12} color={C.mute}>Doc: {detail.header.sDocNo}</Typography>
                )}
              </Box>
            </Stack>
            {selectedTrans && (
              <Chip label={`Trans #${selectedTrans}`}
                sx={{bgcolor:C.pLt, color:C.txt, fontWeight:700, border:`1px solid ${C.bdrM}`}}/>
            )}
          </Box>

          <Box sx={{p:3, bgcolor:"#fff", maxHeight:"70vh", overflowY:"auto"}}>
            {detailLoading ? (
              <Box sx={{textAlign:"center", py:6}}>
                <CircularProgress sx={{color:C.p}} size={40}/>
                <Typography sx={{mt:2, color:C.mute, fontWeight:600}}>Loading details…</Typography>
              </Box>
            ) : detail ? (
              <>
              
                <Grid container spacing={1.5} sx={{mb:3}}>
                  <Grid item xs={12} sm={6} md={3}>
                    <InfoChip icon={<AssignIcon sx={{fontSize:17}}/>} label="Doc No"   value={detail.header.sDocNo}/>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <InfoChip icon={<CalendarIcon sx={{fontSize:17}}/>} label="Date"   value={detail.header.Date}/>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <InfoChip icon={<FolderIcon sx={{fontSize:17}}/>} label="Project"  value={detail.header.Project}/>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <InfoChip icon={<LocationIcon sx={{fontSize:17}}/>} label="Location" value={detail.header.sLocation}/>
                  </Grid>
                </Grid>

                <Divider sx={{mb:2.5, borderColor:C.bdr}}/>

               
                <Typography sx={{fontWeight:800, fontSize:13.5, color:C.txt, mb:1.5,
                  textTransform:"uppercase", letterSpacing:".06em"}}>
                  Observations ({detail.body.length})
                </Typography>

                {detail.body.length === 0 ? (
                  <Typography fontSize={13} color={C.mute} fontStyle="italic">No observation rows found.</Typography>
                ) : (
                  <TableContainer sx={{borderRadius:"10px", border:`1.5px solid ${C.bdr}`, overflow:"hidden"}}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{width:36}}>#</TableCell>
                          <TableCell>Observation</TableCell>
                          <TableCell sx={{width:100}}>Risk</TableCell>
                          <TableCell>Action Required</TableCell>
                          <TableCell>Action By</TableCell>
                          <TableCell sx={{width:110}}>Target Date</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {detail.body.map((b, i) => (
                          <TableRow key={b.iTransDtId || i} sx={{
                            bgcolor: i % 2 === 0 ? "#fff" : C.sAlt,
                            "&:hover td":{bgcolor:alpha(C.p,.025)},
                          }}>
                            <TableCell>
                              <Typography fontSize={12} fontWeight={700} color={C.mute}>{i + 1}</Typography>
                            </TableCell>
                            <TableCell sx={{minWidth:180}}>
                              <Typography fontSize={13.5} color={C.txt}>{b.sObservation || "—"}</Typography>
                            </TableCell>
                            <TableCell>
                              <RiskBadge level={b.iRiskLevel}/>
                            </TableCell>
                            <TableCell sx={{minWidth:160}}>
                              <Typography fontSize={13.5} color={b.sActionReq ? C.txt : C.mute}
                                fontStyle={b.sActionReq ? "normal" : "italic"}>
                                {b.sActionReq || "—"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={.6}>
                                <PersonIcon sx={{fontSize:14, color:C.mute}}/>
                                <Typography fontSize={13} color={C.txt} fontWeight={600}>
                                  {b.iActionBy || "—"}
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={.6}>
                                <CalendarIcon sx={{fontSize:13, color:C.mute}}/>
                                <Typography fontSize={13} color={C.mute}>{b.TargetDate || "—"}</Typography>
                              </Stack>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </>
            ) : null}
          </Box>

          {/* Dialog Footer */}
          <DialogActions sx={{px:3, py:2, bgcolor:C.pXlt, borderTop:`1px solid ${C.bdr}`}}>
            <Button onClick={closeDetail} variant="outlined"
              sx={{borderColor:C.bdrM, color:C.p, minWidth:100,
                "&:hover":{borderColor:C.p, bgcolor:C.pLt}}}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* ═══ SNACKBAR ═══ */}
        <Snackbar open={snack.open} autoHideDuration={3500}
          onClose={() => setSnack(s => ({...s, open:false}))}
          anchorOrigin={{vertical:"bottom", horizontal:"right"}}>
          <Alert severity={snack.sev} variant="filled"
            sx={{fontWeight:700, borderRadius:"10px", fontSize:13.5}}>
            {snack.msg}
          </Alert>
        </Snackbar>

      </Box>
    </ThemeProvider>
  );
}