import { Box, Typography, Button } from '@mui/material';
import { motion } from 'framer-motion';

const EmptyState = ({
    icon,
    title,
    description,
    action,
    color = 'primary' // primary, secondary, error, warning, info, success
}) => {
    // Map color names to actual theme colors for the background
    const getBgColor = (themeColor) => {
        const colors = {
            primary: 'rgba(33, 150, 243, 0.08)',
            secondary: 'rgba(156, 39, 176, 0.08)',
            error: 'rgba(211, 47, 47, 0.08)',
            warning: 'rgba(237, 108, 2, 0.08)',
            info: 'rgba(2, 136, 209, 0.08)',
            success: 'rgba(46, 125, 50, 0.08)',
            text: 'rgba(0, 0, 0, 0.04)'
        };
        return colors[themeColor] || colors.primary;
    };

    const getColor = (themeColor) => {
        const colors = {
            primary: 'primary.main',
            secondary: 'secondary.main',
            error: 'error.main',
            warning: 'warning.main',
            info: 'info.main',
            success: 'success.main',
            text: 'text.secondary'
        };
        return colors[themeColor] || 'primary.main';
    };

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 4,
                textAlign: 'center',
                height: '100%',
                minHeight: 300
            }}
        >
            <Box sx={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                bgcolor: getBgColor(color),
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 2,
                color: getColor(color)
            }}>
                {icon}
            </Box>

            <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                {title}
            </Typography>

            {description && (
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 400, mb: 3 }}>
                    {description}
                </Typography>
            )}

            {action && (
                <Box>
                    {action}
                </Box>
            )}
        </Box>
    );
};

export default EmptyState;
