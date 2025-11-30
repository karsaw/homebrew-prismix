import { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    Box,
    Typography,
    Tabs,
    Tab,
    IconButton,
    List,
    ListItem,
    ListItemText,
    Paper,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Link,
    Button,
    Grid,
    Chip,
    Divider
} from '@mui/material';
import {
    Close,
    Help,
    Keyboard,
    QuestionAnswer,
    Info,
    ExpandMore,
    Launch,
    Code,
    Storage,
    Search,
    Description,
    ContentCopy
} from '@mui/icons-material';
import { quickReference, apiReference, queryExamples, mangoOperators } from '../data/apiDocs';

const HelpCenter = ({ isOpen, onClose, initialTab = 0 }) => {
    const [activeTab, setActiveTab] = useState(initialTab);
    const [apiTab, setApiTab] = useState(0);

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
        }
    }, [isOpen, initialTab]);

    const handleCopy = (text) => {
        navigator.clipboard.writeText(text);
    };

    const TabPanel = ({ children, value, index }) => (
        <div role="tabpanel" hidden={value !== index} style={{ height: '100%' }}>
            {value === index && (
                <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
                    {children}
                </Box>
            )}
        </div>
    );

    const ShortcutItem = ({ keys, description }) => (
        <ListItem sx={{ borderBottom: '1px solid', borderColor: 'divider', py: 1.5 }}>
            <ListItemText primary={description} />
            <Box sx={{ display: 'flex', gap: 0.5 }}>
                {keys.map((key, i) => (
                    <Box
                        key={i}
                        component="span"
                        sx={{
                            bgcolor: 'action.selected',
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 1,
                            px: 1,
                            py: 0.5,
                            fontSize: '0.75rem',
                            fontFamily: 'monospace',
                            fontWeight: 600,
                            minWidth: 24,
                            textAlign: 'center'
                        }}
                    >
                        {key}
                    </Box>
                ))}
            </Box>
        </ListItem>
    );

    const CodeBlock = ({ code, language = 'http' }) => (
        <Box sx={{
            position: 'relative',
            bgcolor: 'rgba(0, 0, 0, 0.05)',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 0,
            p: 2,
            fontFamily: 'monospace',
            fontSize: '0.875rem',
            overflow: 'auto',
            '&:hover .copy-button': {
                opacity: 1
            }
        }}>
            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{code}</pre>
            <IconButton
                className="copy-button"
                size="small"
                onClick={() => handleCopy(code)}
                sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    opacity: 0,
                    transition: 'opacity 0.2s',
                    bgcolor: 'background.paper',
                    borderRadius: 0,
                    '&:hover': {
                        bgcolor: 'action.hover'
                    }
                }}
            >
                <ContentCopy sx={{ fontSize: 16 }} />
            </IconButton>
        </Box>
    );

    // API Documentation Components
    const QuickReferenceTab = () => (
        <Box>
            {quickReference.map((section, idx) => (
                <Box key={idx} sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                        {section.title}
                    </Typography>
                    <Box sx={{ display: 'grid', gap: 1 }}>
                        {section.items.map((item, i) => (
                            <Box key={i} sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 1.5, bgcolor: 'action.hover', borderRadius: 0 }}>
                                <Chip
                                    label={item.method || item.code}
                                    size="small"
                                    sx={{ minWidth: 80, fontWeight: 600, borderRadius: 0 }}
                                />
                                <Typography variant="body2">{item.description}</Typography>
                            </Box>
                        ))}
                    </Box>
                </Box>
            ))}
        </Box>
    );

    const ApiReferenceTab = () => (
        <Box>
            {apiReference.map((category, idx) => (
                <Box key={idx} sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#64b5f6' }}>
                        {category.category}
                    </Typography>
                    {category.items.map((item, i) => (
                        <Box key={i} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 0 }}>
                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                                <Chip label={item.method} size="small" sx={{ fontWeight: 600, borderRadius: 0 }} />
                                <Typography variant="body1" sx={{ fontFamily: 'monospace', fontWeight: 600 }}>
                                    {item.endpoint}
                                </Typography>
                            </Box>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {item.description}
                            </Typography>
                            <Typography variant="caption" sx={{ display: 'block', mb: 1, fontWeight: 600, textTransform: 'uppercase' }}>
                                Example:
                            </Typography>
                            <CodeBlock code={item.example} />
                            {item.response && (
                                <Box>
                                    <Typography variant="caption" sx={{ display: 'block', mt: 2, mb: 1, fontWeight: 600, textTransform: 'uppercase' }}>
                                        Response:
                                    </Typography>
                                    <CodeBlock code={item.response} language="json" />
                                </Box>
                            )}
                        </Box>
                    ))}
                </Box>
            ))}
        </Box>
    );

    const QueryExamplesTab = () => (
        <Box>
            {queryExamples.map((category, idx) => (
                <Box key={idx} sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#ba68c8' }}>
                        {category.category}
                    </Typography>
                    {category.items.map((item, i) => (
                        <Box key={i} sx={{ mb: 3, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 0 }}>
                            <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                                {item.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                {item.description}
                            </Typography>
                            <CodeBlock code={item.code} />
                            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1, fontStyle: 'italic' }}>
                                💡 {item.explanation}
                            </Typography>
                        </Box>
                    ))}
                </Box>
            ))}
        </Box>
    );

    const MangoOperatorsTab = () => (
        <Box>
            {mangoOperators.map((category, idx) => (
                <Box key={idx} sx={{ mb: 4 }}>
                    <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: '#81c784' }}>
                        {category.category} Operators
                    </Typography>
                    <Box sx={{ display: 'grid', gap: 2 }}>
                        {category.operators.map((op, i) => (
                            <Box key={i} sx={{ p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 0 }}>
                                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 1 }}>
                                    <Chip label={op.name} size="small" sx={{ fontFamily: 'monospace', fontWeight: 600, borderRadius: 0 }} />
                                    <Typography variant="body2">{op.description}</Typography>
                                </Box>
                                <CodeBlock code={op.example} language="json" />
                            </Box>
                        ))}
                    </Box>
                </Box>
            ))}
        </Box>
    );

    return (
        <Dialog
            open={isOpen}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
                elevation: 0,
                sx: {
                    borderRadius: 0,
                    border: '1px solid',
                    borderColor: 'divider',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                    height: '80vh',
                    maxHeight: 800
                }
            }}
        >
            <DialogTitle sx={{
                borderBottom: '1px solid',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                py: 2,
                bgcolor: 'background.paper'
            }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Help sx={{ color: 'primary.main' }} />
                    <Typography variant="h6" fontWeight={600}>Help Center</Typography>
                </Box>
                <IconButton onClick={onClose} size="small">
                    <Close />
                </IconButton>
            </DialogTitle>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
                <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                    <Tab icon={<Description fontSize="small" />} iconPosition="start" label="Guide" />
                    <Tab icon={<Keyboard fontSize="small" />} iconPosition="start" label="Shortcuts" />
                    <Tab icon={<Code fontSize="small" />} iconPosition="start" label="API Reference" />
                    <Tab icon={<QuestionAnswer fontSize="small" />} iconPosition="start" label="FAQ" />
                    <Tab icon={<Info fontSize="small" />} iconPosition="start" label="About" />
                </Tabs>
            </Box>

            <DialogContent sx={{ p: 0, bgcolor: 'background.default' }}>
                {/* Guide Tab */}
                <TabPanel value={activeTab} index={0}>
                    <Typography variant="h6" gutterBottom fontWeight={600}>Getting Started with Prismix</Typography>
                    <Typography paragraph color="text.secondary">
                        Prismix is a modern, visual query builder and manager for CouchDB. Here's how to get the most out of it.
                    </Typography>

                    <Grid container spacing={3} sx={{ mt: 1 }}>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 2, height: '100%', border: '1px solid', borderColor: 'divider' }} elevation={0}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <Storage color="primary" />
                                    <Typography variant="subtitle1" fontWeight={600}>Connecting</Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    Click the settings icon in the sidebar to configure your connection. You'll need your CouchDB URL, username, and password.
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 2, height: '100%', border: '1px solid', borderColor: 'divider' }} elevation={0}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <Search color="secondary" />
                                    <Typography variant="subtitle1" fontWeight={600}>Querying</Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary">
                                    Use the Query Builder to construct Mango queries visually. You can filter, sort, and limit results without writing JSON manually.
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 2, height: '100%', border: '1px solid', borderColor: 'divider' }} elevation={0}>
                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                                    <Code color="success" />
                                    <Typography variant="subtitle1" fontWeight={600}>API Reference</Typography>
                                </Box>
                                <Typography variant="body2" color="text.secondary" paragraph>
                                    Need to know the raw API endpoints? Check out our built-in API documentation.
                                </Typography>
                                <Button
                                    variant="outlined"
                                    size="small"
                                    startIcon={<Code />}
                                    onClick={() => setActiveTab(2)}
                                >
                                    Go to API Docs
                                </Button>
                            </Paper>
                        </Grid>
                    </Grid>
                </TabPanel>

                {/* Shortcuts Tab */}
                <TabPanel value={activeTab} index={1}>
                    <Typography variant="h6" gutterBottom fontWeight={600}>Keyboard Shortcuts</Typography>
                    <List sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                        <ShortcutItem keys={['⌘', 'K']} description="Global Search (Databases)" />
                        <ShortcutItem keys={['?']} description="Open API Documentation" />
                        <ShortcutItem keys={['Esc']} description="Close Dialogs / Clear Search" />
                    </List>
                </TabPanel>

                {/* API Reference Tab */}
                <TabPanel value={activeTab} index={2}>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                        <Tabs
                            value={apiTab}
                            onChange={(e, v) => setApiTab(v)}
                            variant="scrollable"
                            scrollButtons="auto"
                            sx={{ minHeight: 48 }}
                        >
                            <Tab label="Quick Reference" sx={{ minHeight: 48 }} />
                            <Tab label="Endpoints" sx={{ minHeight: 48 }} />
                            <Tab label="Query Examples" sx={{ minHeight: 48 }} />
                            <Tab label="Mango Operators" sx={{ minHeight: 48 }} />
                        </Tabs>
                    </Box>
                    {apiTab === 0 && <QuickReferenceTab />}
                    {apiTab === 1 && <ApiReferenceTab />}
                    {apiTab === 2 && <QueryExamplesTab />}
                    {apiTab === 3 && <MangoOperatorsTab />}
                </TabPanel>

                {/* FAQ Tab */}
                <TabPanel value={activeTab} index={3}>
                    <Typography variant="h6" gutterBottom fontWeight={600}>Frequently Asked Questions</Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Accordion elevation={0} sx={{ border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                                <Typography fontWeight={500}>How do I create a new database?</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography variant="body2" color="text.secondary">
                                    Currently, Prismix focuses on querying and managing existing databases. Database creation will be added in a future update.
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                        <Accordion elevation={0} sx={{ border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                                <Typography fontWeight={500}>Is my password safe?</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography variant="body2" color="text.secondary">
                                    Yes. Your connection details are stored locally in your browser's localStorage. They are never sent to any external server, only directly to your CouchDB instance.
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                        <Accordion elevation={0} sx={{ border: '1px solid', borderColor: 'divider', '&:before': { display: 'none' } }}>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                                <Typography fontWeight={500}>What is a Mango Query?</Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography variant="body2" color="text.secondary">
                                    Mango is a declarative JSON querying language for CouchDB. It allows you to find documents using a simple JSON syntax, similar to MongoDB.
                                </Typography>
                            </AccordionDetails>
                        </Accordion>
                    </Box>
                </TabPanel>

                {/* About Tab */}
                <TabPanel value={activeTab} index={4}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4, textAlign: 'center' }}>
                        <Box
                            sx={{
                                mb: 3,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            <img
                                src="/prismix-logo.png"
                                alt="Prismix Logo"
                                style={{
                                    width: '80px',
                                    height: '80px',
                                    objectFit: 'contain'
                                }}
                            />
                        </Box>
                        <Typography variant="h5" fontWeight={700} gutterBottom>Prismix</Typography>
                        <Typography variant="body1" color="text.secondary" gutterBottom>
                            A modern, visual interface for CouchDB
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ mb: 4, display: 'block' }}>
                            Version 1.0.0
                        </Typography>

                        <Box sx={{ display: 'flex', gap: 2 }}>
                            <Button
                                variant="outlined"
                                startIcon={<Launch />}
                                href="https://couchdb.apache.org/"
                                target="_blank"
                            >
                                CouchDB Website
                            </Button>
                            <Button
                                variant="outlined"
                                startIcon={<Launch />}
                                href="https://docs.couchdb.org/en/stable/api/index.html"
                                target="_blank"
                            >
                                Official Docs
                            </Button>
                        </Box>
                    </Box>
                </TabPanel>
            </DialogContent>
        </Dialog>
    );
};

export default HelpCenter;
