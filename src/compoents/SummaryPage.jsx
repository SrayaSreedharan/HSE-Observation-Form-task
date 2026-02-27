import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {Box, Container, Typography, Paper, Table, TableBody, TableCell,TableContainer, TableHead, TableRow, IconButton, CircularProgress,Stack, Dialog, DialogActions, Button, Chip, Grid, Snackbar, Alert,Divider, useMediaQuery, Collapse,} from "@mui/material";
import {HealthAndSafety as SafetyIcon, Visibility as ViewIcon,ListAlt as ListAltIcon, ArrowBack as ArrowBackIcon, Refresh as RefreshIcon,CalendarToday as CalendarIcon, LocationOn as LocationIcon,FolderOpen as FolderIcon, Person as PersonIcon, Assignment as AssignIcon,ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon,} from "@mui/icons-material";
import { createTheme, ThemeProvider, alpha, useTheme } from "@mui/material/styles";

const C = {
  p:"#43A047", s:"#81C784", bg:"#F9FBF9", txt:"#2E7D32", pDk:"#388E3C", pLt:"#E8F5E9",
  pXlt:"#F1F8F1", bdr:"#C8E6C9", bdrM:"#A5D6A7", mute:"#66A96A", surf:"#FFFFFF", sAlt:"#F9FBF9",
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
      <Box sx={{px:{xs:2,sm:3}, py:2, background:C.pLt, borderBottom:`1.5px solid ${C.bdrM}`,
        display:"flex", alignItems:"center", justifyContent:"space-between"}}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{width:34, height:34, borderRadius:"8px", bgcolor:alpha(C.p,.15),
            border:`1.5px solid ${C.bdrM}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
            {icon}
          </Box>
          <Typography sx={{fontWeight:800, fontSize:{xs:13,sm:15}, color:C.txt}}>{title}</Typography>
        </Stack>
        {action}
      </Box>
      <Box sx={{p:{xs:2,sm:3}, bgcolor:"#FFFFFF"}}>{children}</Box>
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

/* ── Mobile Summary Card ── */
function MobileSummaryCard({ row, idx, onView }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <Paper elevation={0} sx={{
      mb:1.5, border:`1.5px solid ${idx === 0 ? C.p : C.bdr}`,
      borderRadius:"10px", overflow:"hidden",
      boxShadow: idx === 0 ? `0 2px 12px ${alpha(C.p,.15)}` : `0 1px 4px ${C.shad}`,
    }}>
      {/* Header Row */}
      <Box sx={{
        px:2, py:1.5,
        bgcolor: idx === 0 ? alpha(C.p,.06) : idx % 2 === 0 ? "#fff" : C.sAlt,
        display:"flex", alignItems:"center", justifyContent:"space-between",
        borderBottom: expanded ? `1px solid ${C.bdr}` : "none",
      }}>
        <Stack direction="row" alignItems="center" sx={{flex:1, minWidth:0, gap:1}}>
          {idx === 0 && (
            <Chip label="NEW" size="small" sx={{
              height:17, fontSize:9, fontWeight:800,
              bgcolor:C.p, color:"#fff", borderRadius:"4px", flexShrink:0,
            }}/>
          )}
          <Box sx={{minWidth:0, flex:1}}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography fontWeight={800} fontSize={13.5} color={C.p}>#{row.iTransId}</Typography>
              <Typography fontWeight={600} fontSize={12} color={C.mute} sx={{overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
                {row.sDocNo}
              </Typography>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={.5} sx={{mt:.3}}>
              <FolderIcon sx={{fontSize:12, color:C.mute}}/>
              <Typography fontSize={12} color={C.txt} fontWeight={600} sx={{overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap"}}>
                {row.Project}
              </Typography>
            </Stack>
          </Box>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={.5} sx={{flexShrink:0, ml:1}}>
          <IconButton size="small" onClick={() => onView(row.iTransId)} sx={{
            color:C.p, bgcolor:C.pLt, border:`1.5px solid ${C.bdrM}`,
            borderRadius:"7px", width:32, height:32,
          }}>
            <ViewIcon sx={{fontSize:15}}/>
          </IconButton>
          <IconButton size="small" onClick={() => setExpanded(v => !v)} sx={{color:C.mute}}>
            {expanded ? <ExpandLessIcon fontSize="small"/> : <ExpandMoreIcon fontSize="small"/>}
          </IconButton>
        </Stack>
      </Box>

      {/* Expanded Details */}
      <Collapse in={expanded}>
        <Box sx={{px:2, py:1.5, bgcolor:"#fff"}}>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography fontSize={10} fontWeight={700} color={C.mute} textTransform="uppercase" letterSpacing=".07em">Date</Typography>
              <Stack direction="row" alignItems="center" spacing={.5} sx={{mt:.3}}>
                <CalendarIcon sx={{fontSize:13, color:C.mute}}/>
                <Typography fontSize={13} color={C.txt}>{row.Date}</Typography>
              </Stack>
            </Grid>
            <Grid item xs={6}>
              <Typography fontSize={10} fontWeight={700} color={C.mute} textTransform="uppercase" letterSpacing=".07em">Location</Typography>
              <Stack direction="row" alignItems="center" spacing={.5} sx={{mt:.3}}>
                <LocationIcon sx={{fontSize:13, color:C.mute}}/>
                <Typography fontSize={13} color={C.txt}>{row.sLocation}</Typography>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Paper>
  );
}

/* ── Mobile Detail Observation Card ── */
function MobileObsCard({ b, i }) {
  return (
    <Paper elevation={0} sx={{mb:1.5, border:`1.5px solid ${C.bdr}`, borderRadius:"10px", overflow:"hidden"}}>
      <Box sx={{px:2, py:1.5, bgcolor: i % 2 === 0 ? "#fff" : C.sAlt}}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{mb:1}}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Box sx={{width:22, height:22, borderRadius:"5px", bgcolor:C.pLt, border:`1px solid ${C.bdrM}`,
              display:"flex", alignItems:"center", justifyContent:"center"}}>
              <Typography fontSize={10} fontWeight={800} color={C.txt}>{i+1}</Typography>
            </Box>
            <RiskBadge level={b.iRiskLevel}/>
          </Stack>
          {b.TargetDate && (
            <Stack direction="row" alignItems="center" spacing={.4}>
              <CalendarIcon sx={{fontSize:12, color:C.mute}}/>
              <Typography fontSize={11.5} color={C.mute}>{b.TargetDate}</Typography>
            </Stack>
          )}
        </Stack>

        <Typography fontSize={10} fontWeight={700} color={C.mute} textTransform="uppercase" letterSpacing=".07em">Observation</Typography>
        <Typography fontSize={13.5} color={C.txt} sx={{mt:.3, mb:1}}>{b.sObservation || "—"}</Typography>

        {b.sActionReq && (
          <>
            <Typography fontSize={10} fontWeight={700} color={C.mute} textTransform="uppercase" letterSpacing=".07em">Action Required</Typography>
            <Typography fontSize={13} color={C.txt} sx={{mt:.3, mb:1}}>{b.sActionReq}</Typography>
          </>
        )}

        {b.iActionBy && (
          <Stack direction="row" alignItems="center" spacing={.5}>
            <PersonIcon sx={{fontSize:14, color:C.mute}}/>
            <Typography fontSize={13} color={C.txt} fontWeight={600}>{b.iActionBy}</Typography>
          </Stack>
        )}
      </Box>
    </Paper>
  );
}

export default function SummaryPage({ onGoForm }) {
  const navigate  = useNavigate();
  const muiTheme  = useTheme();
  const isMobile  = useMediaQuery(muiTheme.breakpoints.down("md"));

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
      cache:"no-store",
      headers:{"Cache-Control":"no-cache", "Pragma":"no-cache"},
    })
      .then(r => r.json())
      .then(d => {
        if (d.Status === "Success") {
          const list = JSON.parse(d.ResultData || "[]");
          list.sort((a, b) => Number(b.iTransId) - Number(a.iTransId));
          setSummaries(list);
          setLastFetched(new Date().toLocaleTimeString());
        } else {
          toast(d.MessageDescription || "Failed to load summary.");
        }
      })
      .catch(() => toast("Network error loading summary."))
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
        if (d.Status === "Success") {
          let parsed = {};
          try {
            const rd = d.ResultData;
            parsed = typeof rd === "string" ? JSON.parse(rd) : rd;
          } catch {}
          setDetail({
            header: parsed.Header?.[0] || {},
            body:   Array.isArray(parsed.Body) ? parsed.Body : [],
          });
        } else {
          toast("Failed to load details.");
        }
      })
      .catch(() => toast("Network error loading details."))
      .finally(() => setDetailLoading(false));
  };

  const closeDetail = () => { setSelectedTrans(null); setDetail(null); };

  return (
    <ThemeProvider theme={theme}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');`}</style>
      <Box sx={{minHeight:"100vh", bgcolor:C.bg}}>

        {/* ── Top Nav ── */}
        <Box sx={{background:`linear-gradient(135deg,${C.p} 0%,${C.pDk} 100%)`,
          boxShadow:`0 3px 16px ${C.shad}`, position:"sticky", top:0, zIndex:300}}>
          <GreenBar h={3}/>
          <Container maxWidth="xl">
            <Stack direction="row" alignItems="center" justifyContent="space-between"
              sx={{height:{xs:56,sm:62}}}>
              <Stack direction="row" alignItems="center" spacing={1.2}>
                <Box sx={{width:{xs:36,sm:42}, height:{xs:36,sm:42}, borderRadius:"11px",
                  bgcolor:alpha("#fff",.2), border:`1.5px solid ${alpha("#fff",.4)}`,
                  display:"flex", alignItems:"center", justifyContent:"center"}}>
                  <SafetyIcon sx={{color:"#fff", fontSize:{xs:20,sm:24}}}/>
                </Box>
                <Box>
                  <Typography sx={{fontWeight:900, color:"#fff", fontSize:{xs:13,sm:15.5}, lineHeight:1.2}}>
                    HSE Observation System
                  </Typography>
                  {!isMobile && (
                    <Typography sx={{fontSize:9.5, color:alpha("#fff",.8), letterSpacing:".12em", fontWeight:700}}>
                      HEALTH · SAFETY · ENVIRONMENT
                    </Typography>
                  )}
                </Box>
              </Stack>
              <Stack direction="row" spacing={.5} alignItems="center">
                {!isMobile && (
                  <Box sx={{px:2.2, py:.85, bgcolor:alpha("#fff",.2), border:`1.5px solid ${alpha("#fff",.45)}`,
                    borderRadius:"8px", display:"flex", alignItems:"center", gap:.8}}>
                    <Box sx={{width:7, height:7, borderRadius:"50%", bgcolor:"#fff"}}/>
                    <Typography sx={{color:"#fff", fontWeight:800, fontSize:13.5}}>Summary</Typography>
                  </Box>
                )}
                <Button onClick={goForm} size={isMobile ? "small" : "medium"}
                  sx={{color:alpha("#fff",.9), fontWeight:700, fontSize:{xs:12,sm:13.5},
                    border:"1.5px solid transparent", borderRadius:"8px", px:{xs:1.5,sm:2},
                    "&:hover":{bgcolor:alpha("#fff",.12), borderColor:alpha("#fff",.35), color:"#fff"}}}>
                  {isMobile ? "Form" : "Observation Form"}
                </Button>
              </Stack>
            </Stack>
          </Container>
        </Box>

        <Container maxWidth="xl" sx={{py:{xs:2,sm:3.5}, px:{xs:1.5,sm:3}}}>

          {/* ── Banner ── */}
          <Paper elevation={0} sx={{mb:3, overflow:"hidden", border:`1.5px solid ${C.bdr}`, boxShadow:`0 2px 12px ${C.shad}`}}>
            <GreenBar/>
            <Box sx={{p:{xs:"14px 16px",sm:"20px 28px"}, background:"#fff", display:"flex",
              justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:1.5}}>
              <Stack direction="row" alignItems="center" spacing={1.5}>
                <Box sx={{width:{xs:40,sm:52}, height:{xs:40,sm:52}, borderRadius:"13px", bgcolor:C.pLt,
                  border:`1.5px solid ${C.bdrM}`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0}}>
                  <ListAltIcon sx={{color:C.p, fontSize:{xs:22,sm:28}}}/>
                </Box>
                <Box>
                  <Typography sx={{fontWeight:900, fontSize:{xs:15,sm:19}, color:C.txt, lineHeight:1.2}}>
                    Observations Overview
                  </Typography>
                  <Typography sx={{fontSize:{xs:11.5,sm:13}, color:C.mute, mt:.3}}>
                    {loading ? "Syncing with server…" : `${summaries.length} records · Last updated: ${lastFetched}`}
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1} alignItems="center">
                <IconButton onClick={fetchAll} disabled={loading}
                  sx={{border:`1.5px solid ${C.bdrM}`, color:C.p, borderRadius:"8px",
                    width:{xs:36,sm:40}, height:{xs:36,sm:40},
                    "&:hover":{bgcolor:C.pLt}}}>
                  {loading ? <CircularProgress size={18} sx={{color:C.p}}/> : <RefreshIcon fontSize="small"/>}
                </IconButton>
                <Button variant="contained" onClick={goForm} size={isMobile ? "small" : "medium"}
                  startIcon={<ArrowBackIcon/>}
                  sx={{background:`linear-gradient(135deg,${C.s} 0%,${C.p} 100%)`,
                    boxShadow:`0 4px 12px ${alpha(C.p,.3)}`,
                    "&:hover":{background:`linear-gradient(135deg,${C.p} 0%,${C.pDk} 100%)`}}}>
                  {isMobile ? "New" : "New Observation"}
                </Button>
              </Stack>
            </Box>
          </Paper>

          {/* ── Records ── */}
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
            ) : isMobile ? (
              /* MOBILE: Card list */
              <Box>
                {summaries.map((row, idx) => (
                  <MobileSummaryCard key={row.iTransId} row={row} idx={idx} onView={openDetail}/>
                ))}
              </Box>
            ) : (
              /* DESKTOP: Table */
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

        {/* ── Detail Dialog ── */}
        <Dialog open={!!selectedTrans} onClose={closeDetail}
          maxWidth="md" fullWidth fullScreen={isMobile}
          PaperProps={{sx:{overflow:"hidden", border:`1.5px solid ${C.bdr}`,
            mx:{xs:0,sm:"auto"}, borderRadius:{xs:0,sm:"12px"}}}}>
          <GreenBar/>
          <Box sx={{px:{xs:2,sm:3}, py:2, background:C.pLt, borderBottom:`1.5px solid ${C.bdrM}`,
            display:"flex", alignItems:"center", justifyContent:"space-between"}}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{width:34, height:34, borderRadius:"8px", bgcolor:alpha(C.p,.15),
                border:`1.5px solid ${C.bdrM}`, display:"flex", alignItems:"center", justifyContent:"center"}}>
                <AssignIcon sx={{color:C.p, fontSize:19}}/>
              </Box>
              <Box>
                <Typography fontWeight={800} fontSize={{xs:13,sm:15}} color={C.txt}>Observation Details</Typography>
                {detail?.header?.sDocNo && (
                  <Typography fontSize={12} color={C.mute}>Doc: {detail.header.sDocNo}</Typography>
                )}
              </Box>
            </Stack>
            <Stack direction="row" alignItems="center" spacing={1}>
              {selectedTrans && (
                <Chip label={`Trans #${selectedTrans}`} size="small"
                  sx={{bgcolor:C.pLt, color:C.txt, fontWeight:700, border:`1px solid ${C.bdrM}`}}/>
              )}
              {isMobile && (
                <IconButton size="small" onClick={closeDetail} sx={{color:C.mute}}>
                  ✕
                </IconButton>
              )}
            </Stack>
          </Box>

          <Box sx={{p:{xs:2,sm:3}, bgcolor:"#fff", flex:1, overflowY:"auto", maxHeight:{xs:"100%",sm:"70vh"}}}>
            {detailLoading ? (
              <Box sx={{textAlign:"center", py:6}}>
                <CircularProgress sx={{color:C.p}} size={40}/>
                <Typography sx={{mt:2, color:C.mute, fontWeight:600}}>Loading details…</Typography>
              </Box>
            ) : detail ? (
              <>
                {/* Header Info */}
                <Grid container spacing={1.5} sx={{mb:3}}>
                  <Grid item xs={6} sm={6} md={3}>
                    <InfoChip icon={<AssignIcon sx={{fontSize:17}}/>} label="Doc No" value={detail.header.sDocNo}/>
                  </Grid>
                  <Grid item xs={6} sm={6} md={3}>
                    <InfoChip icon={<CalendarIcon sx={{fontSize:17}}/>} label="Date" value={detail.header.Date}/>
                  </Grid>
                  <Grid item xs={6} sm={6} md={3}>
                    <InfoChip icon={<FolderIcon sx={{fontSize:17}}/>} label="Project" value={detail.header.Project}/>
                  </Grid>
                  <Grid item xs={6} sm={6} md={3}>
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
                ) : isMobile ? (
                  /* MOBILE: Obs cards */
                  <Box>
                    {detail.body.map((b, i) => (
                      <MobileObsCard key={b.iTransDtId || i} b={b} i={i}/>
                    ))}
                  </Box>
                ) : (
                  /* DESKTOP: Table */
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
                              <Typography fontSize={12} fontWeight={700} color={C.mute}>{i+1}</Typography>
                            </TableCell>
                            <TableCell sx={{minWidth:180}}>
                              <Typography fontSize={13.5} color={C.txt}>{b.sObservation || "—"}</Typography>
                            </TableCell>
                            <TableCell><RiskBadge level={b.iRiskLevel}/></TableCell>
                            <TableCell sx={{minWidth:160}}>
                              <Typography fontSize={13.5} color={b.sActionReq ? C.txt : C.mute}
                                fontStyle={b.sActionReq ? "normal" : "italic"}>
                                {b.sActionReq || "—"}
                              </Typography>
                            </TableCell>
                            <TableCell>
                              <Stack direction="row" alignItems="center" spacing={.6}>
                                <PersonIcon sx={{fontSize:14, color:C.mute}}/>
                                <Typography fontSize={13} color={C.txt} fontWeight={600}>{b.iActionBy || "—"}</Typography>
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

          <DialogActions sx={{px:{xs:2,sm:3}, py:2, bgcolor:C.pXlt, borderTop:`1px solid ${C.bdr}`}}>
            <Button onClick={closeDetail} variant="outlined" fullWidth={isMobile}
              sx={{borderColor:C.bdrM, color:C.p, minWidth:100,
                "&:hover":{borderColor:C.p, bgcolor:C.pLt}}}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* ── Snackbar ── */}
        <Snackbar open={snack.open} autoHideDuration={3500}
          onClose={() => setSnack(s => ({...s, open:false}))}
          anchorOrigin={{vertical:"bottom", horizontal:isMobile ? "center" : "right"}}>
          <Alert severity={snack.sev} variant="filled"
            sx={{fontWeight:700, borderRadius:"10px", fontSize:13.5, width:{xs:"90vw",sm:"auto"}}}>
            {snack.msg}
          </Alert>
        </Snackbar>

      </Box>
    </ThemeProvider>
  );
}