import React, { useState } from 'react';
import {
    Box,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    Typography,
    TextField,
    Tooltip,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import {
    FirstPage,
    LastPage,
    NavigateBefore,
    NavigateNext,
} from '@mui/icons-material';

const EnhancedPagination = ({
    totalItems,
    currentPage,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
    pageSizeOptions = [10, 25, 50, 100, 500],
    compact = false,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [goToPage, setGoToPage] = useState('');

    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, totalItems);

    const handleFirstPage = () => onPageChange(1);
    const handlePreviousPage = () => onPageChange(currentPage - 1);
    const handleNextPage = () => onPageChange(currentPage + 1);
    const handleLastPage = () => onPageChange(totalPages);

    const handleGoToPage = (e) => {
        if (e.key === 'Enter') {
            const page = parseInt(goToPage);
            if (page >= 1 && page <= totalPages) {
                onPageChange(page);
                setGoToPage('');
            }
        }
    };

    const handlePageSizeChange = (e) => {
        onItemsPerPageChange(e.target.value);
        onPageChange(1); // Reset to first page when changing page size
    };

    if (totalItems === 0) {
        return null;
    }

    const isCompact = compact || isMobile;

    return (
        <Box
            sx={{
                display: 'flex',
                flexDirection: isCompact ? 'column' : 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
                p: 2,
                borderTop: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
            }}
        >
            {/* Left: Navigation Controls */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Tooltip title="First page">
                    <span>
                        <IconButton
                            size="small"
                            onClick={handleFirstPage}
                            disabled={currentPage === 1}
                            sx={{
                                color: 'text.secondary',
                                '&:hover': { bgcolor: 'action.hover' },
                                '&.Mui-disabled': { color: 'action.disabled' },
                            }}
                        >
                            <FirstPage fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>

                <Tooltip title="Previous page">
                    <span>
                        <IconButton
                            size="small"
                            onClick={handlePreviousPage}
                            disabled={currentPage === 1}
                            sx={{
                                color: 'text.secondary',
                                '&:hover': { bgcolor: 'action.hover' },
                                '&.Mui-disabled': { color: 'action.disabled' },
                            }}
                        >
                            <NavigateBefore fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>

                {/* Page Display / Go To Page */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mx: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                        Page
                    </Typography>
                    <TextField
                        size="small"
                        value={goToPage || currentPage}
                        onChange={(e) => setGoToPage(e.target.value)}
                        onKeyDown={handleGoToPage}
                        onBlur={() => setGoToPage('')}
                        placeholder={String(currentPage)}
                        sx={{
                            width: 60,
                            '& .MuiOutlinedInput-root': {
                                fontSize: '0.875rem',
                                '& input': {
                                    textAlign: 'center',
                                    p: 0.75,
                                },
                                '& fieldset': {
                                    borderColor: 'divider',
                                },
                            },
                        }}
                    />
                    <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                        of {totalPages}
                    </Typography>
                </Box>

                <Tooltip title="Next page">
                    <span>
                        <IconButton
                            size="small"
                            onClick={handleNextPage}
                            disabled={currentPage === totalPages}
                            sx={{
                                color: 'text.secondary',
                                '&:hover': { bgcolor: 'action.hover' },
                                '&.Mui-disabled': { color: 'action.disabled' },
                            }}
                        >
                            <NavigateNext fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>

                <Tooltip title="Last page">
                    <span>
                        <IconButton
                            size="small"
                            onClick={handleLastPage}
                            disabled={currentPage === totalPages}
                            sx={{
                                color: 'text.secondary',
                                '&:hover': { bgcolor: 'action.hover' },
                                '&.Mui-disabled': { color: 'action.disabled' },
                            }}
                        >
                            <LastPage fontSize="small" />
                        </IconButton>
                    </span>
                </Tooltip>
            </Box>

            {/* Center: Range Display */}
            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                Showing {startIndex}-{endIndex} of {totalItems}
            </Typography>

            {/* Right: Items Per Page */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
                    Items per page:
                </Typography>
                <FormControl size="small">
                    <Select
                        value={itemsPerPage}
                        onChange={handlePageSizeChange}
                        sx={{
                            fontSize: '0.875rem',
                            minWidth: 70,
                            '& .MuiOutlinedInput-notchedOutline': {
                                borderColor: 'divider',
                            },
                        }}
                    >
                        {pageSizeOptions.map((size) => (
                            <MenuItem key={size} value={size}>
                                {size}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
        </Box>
    );
};

export default EnhancedPagination;
