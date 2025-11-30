import { useState, useEffect } from 'react';
import {
    Box,
    Paper,
    Typography,
    Grid,
    IconButton,
    LinearProgress,
    Card,
    CardContent,
    Divider,
    Button,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from '@mui/material';
import {
    Refresh,
    Storage,
    Description,
    Delete,
    Update,
    Schedule,
    PieChart
} from '@mui/icons-material';
import { getDatabaseInfo, getAllDatabases } from '../services/couchdb';

const StatsCard = ({ title, value, subValue, icon, color }) => (
    <Card elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 0, height: '100%' }}>
        <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                <Box sx={{ p: 1, borderRadius: 0, bgcolor: `${color}15` }}>
                    {icon}
                </Box>
                {subValue && (
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                        {subValue}
                    </Typography>
                )}
            </Box>
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 0.5 }}>
                {value}
            </Typography>
            <Typography variant="body2" color="text.secondary">
                {title}
            </Typography>
        </CardContent>
    </Card>
);

const StatsDashboard = ({ selectedDatabase, onDatabaseSelect }) => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [databases, setDatabases] = useState([]);

    useEffect(() => {
        const fetchDatabases = async () => {
            try {
                const dbs = await getAllDatabases();
                setDatabases(dbs.filter(db => !db.startsWith('_')));
            } catch (err) {
                console.error('Failed to fetch databases:', err);
            }
        };
        fetchDatabases();
    }, []);

    const fetchStats = async () => {
        if (!selectedDatabase) return;

        try {
            setLoading(true);
            setError(null);
            const data = await getDatabaseInfo(selectedDatabase);
            setStats(data);
        } catch (err) {
            setError('Failed to fetch database statistics');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, [selectedDatabase]);

    if (!selectedDatabase) {
        return (
            <Box sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 3,
                color: 'text.secondary'
            }}>
                <PieChart sx={{ fontSize: 64, mb: 2, opacity: 0.2 }} />
                <Typography variant="h6" sx={{ mb: 2 }}>No Database Selected</Typography>
                <FormControl sx={{ minWidth: 200 }}>
                    <InputLabel size="small">Select Database</InputLabel>
                    <Select
                        value=""
                        label="Select Database"
                        onChange={(e) => onDatabaseSelect(e.target.value)}
                        size="small"
                        sx={{ borderRadius: 0 }}
                    >
                        {databases.map((db) => (
                            <MenuItem key={db} value={db}>{db}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
        );
    }

    const formatSize = (bytes) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat().format(num);
    };

    return (
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', bgcolor: 'background.default' }}>
            {/* Header */}
            <Box sx={{
                p: 3,
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                bgcolor: 'background.paper'
            }}>
                <Box>
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                        Database Statistics
                    </Typography>
                    <FormControl variant="standard" sx={{ minWidth: 200 }}>
                        <Select
                            value={selectedDatabase}
                            onChange={(e) => onDatabaseSelect(e.target.value)}
                            disableUnderline
                            sx={{
                                fontFamily: 'monospace',
                                color: 'text.secondary',
                                fontSize: '0.875rem',
                                '& .MuiSelect-select': { py: 0 }
                            }}
                        >
                            {databases.map((db) => (
                                <MenuItem key={db} value={db}>{db}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
                <Button
                    startIcon={<Refresh />}
                    onClick={fetchStats}
                    disabled={loading}
                    variant="outlined"
                    sx={{ borderRadius: 0, textTransform: 'none' }}
                >
                    Refresh
                </Button>
            </Box>

            {/* Content */}
            <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
                {loading && <LinearProgress sx={{ mb: 3 }} />}

                {stats && (
                    <Grid container spacing={3}>
                        {/* Summary Cards */}
                        <Grid item xs={12} sm={6} md={3}>
                            <StatsCard
                                title="Total Documents"
                                value={formatNumber(stats.doc_count)}
                                icon={<Description sx={{ color: '#2196f3' }} />}
                                color="#2196f3"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatsCard
                                title="Deleted Documents"
                                value={formatNumber(stats.doc_del_count)}
                                icon={<Delete sx={{ color: '#f44336' }} />}
                                color="#f44336"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatsCard
                                title="Disk Size"
                                value={formatSize(stats.sizes?.file || stats.disk_size)}
                                icon={<Storage sx={{ color: '#ff9800' }} />}
                                color="#ff9800"
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <StatsCard
                                title="Active Data Size"
                                value={formatSize(stats.sizes?.active || stats.data_size)}
                                icon={<PieChart sx={{ color: '#4caf50' }} />}
                                color="#4caf50"
                            />
                        </Grid>

                        {/* Detailed Stats */}
                        <Grid item xs={12} md={6}>
                            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 0, p: 3, height: '100%' }}>
                                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                                    Activity & Sequence
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography color="text.secondary">Update Sequence</Typography>
                                        <Typography sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                                            {typeof stats.update_seq === 'string' ? stats.update_seq.split('-')[0] : stats.update_seq}
                                        </Typography>
                                    </Box>
                                    <Divider />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography color="text.secondary">Purge Sequence</Typography>
                                        <Typography sx={{ fontFamily: 'monospace', fontWeight: 500 }}>{stats.purge_seq}</Typography>
                                    </Box>
                                    <Divider />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography color="text.secondary">Compact Running</Typography>
                                        <Typography sx={{ fontWeight: 500, color: stats.compact_running ? 'warning.main' : 'text.secondary' }}>
                                            {stats.compact_running ? 'Yes' : 'No'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 0, p: 3, height: '100%' }}>
                                <Typography variant="h6" sx={{ mb: 3, fontWeight: 600 }}>
                                    System Info
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography color="text.secondary">Instance Start Time</Typography>
                                        <Typography sx={{ fontFamily: 'monospace', fontWeight: 500 }}>
                                            {new Date(parseInt(stats.instance_start_time) / 1000).toLocaleString()}
                                        </Typography>
                                    </Box>
                                    <Divider />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography color="text.secondary">Disk Format Version</Typography>
                                        <Typography sx={{ fontFamily: 'monospace', fontWeight: 500 }}>{stats.disk_format_version}</Typography>
                                    </Box>
                                    <Divider />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                        <Typography color="text.secondary">Fragmentation</Typography>
                                        <Typography sx={{ fontWeight: 500 }}>
                                            {stats.sizes ?
                                                `${Math.round((1 - stats.sizes.active / stats.sizes.file) * 100)}%` :
                                                'N/A'}
                                        </Typography>
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                )}
            </Box>
        </Box>
    );
};

export default StatsDashboard;
