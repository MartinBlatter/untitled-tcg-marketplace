'use client';

import { useEffect, useState } from 'react';

interface CardItem {
    uuid: string;
    name: string;
    setCode: string;
    number: string;
    oldUuid: string | null;
    type: 'changed' | 'new';
}

interface ReportData {
    totalCardsProcessed: number;
    changedUuids: number;
    newCards: number;
    totalUpdatesNeeded: number;
    processingTimeSeconds: string;
    timestamp: string;
    details: {
        changedCards: CardItem[];
        newCards: CardItem[];
    };
}

export default function ImageUpdateReport() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [report, setReport] = useState<ReportData | null>(null);
    const [exportingCsv, setExportingCsv] = useState(false);

    useEffect(() => {
        async function fetchReport() {
            try {
                setLoading(true);
                const response = await fetch('/api/magic/image-update-report');

                if (!response.ok) {
                    throw new Error(`API responded with status: ${response.status}`);
                }

                const data = await response.json();
                setReport(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error occurred');
                console.error('Error fetching report:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchReport();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleExportCsv = async () => {
        if (!report || report.totalUpdatesNeeded === 0) return;

        try {
            setExportingCsv(true);

            // Open in a new tab to handle large file downloads more gracefully
            window.open('/api/magic/image-update-report?format=csv', '_blank');
        } catch (err) {
            console.error('Error exporting CSV:', err);
        } finally {
            setExportingCsv(false);
        }
    };

    if (loading) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <div className='text-center p-8 max-w-lg mx-auto'>
                    <h1 className='text-2xl font-bold mb-4'>Loading Image Update Report</h1>
                    <p className='mb-4'>This may take a few minutes as we analyze tens of thousands of card records...</p>
                    <div className='w-full h-2 bg-gray-200 rounded-full'>
                        <div className='h-full bg-blue-600 rounded-full animate-pulse'></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className='flex items-center justify-center min-h-screen'>
                <div className='text-center p-8 max-w-lg mx-auto bg-red-50 border border-red-200 rounded-lg'>
                    <h1 className='text-2xl font-bold mb-4 text-red-600'>Error Loading Report</h1>
                    <p className='text-red-700'>{error}</p>
                </div>
            </div>
        );
    }

    if (!report) {
        return null;
    }

    return (
        <div className='container mx-auto p-4 max-w-6xl'>
            <h1 className='text-3xl font-bold mb-6'>Card Image Update Report</h1>

            <div className='bg-white shadow-md rounded-lg p-6 mb-8'>
                <div className='flex justify-between items-start mb-4'>
                    <h2 className='text-xl font-semibold'>Summary</h2>
                    {report.totalUpdatesNeeded > 0 && (
                        <button
                            onClick={handleExportCsv}
                            disabled={exportingCsv}
                            className={`px-4 py-2 rounded ${exportingCsv ? 'bg-gray-300 text-gray-500' : 'bg-green-600 hover:bg-green-700 text-white'} transition-colors`}
                        >
                            {exportingCsv ? 'Preparing Download...' : 'Export All to CSV'}
                        </button>
                    )}
                </div>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6'>
                    <div className='bg-blue-50 p-4 rounded-lg border border-blue-100'>
                        <div className='text-sm text-blue-600'>Total Cards Processed</div>
                        <div className='text-2xl font-bold'>{report.totalCardsProcessed.toLocaleString()}</div>
                    </div>
                    <div className='bg-amber-50 p-4 rounded-lg border border-amber-100'>
                        <div className='text-sm text-amber-600'>Changed UUIDs</div>
                        <div className='text-2xl font-bold'>{report.changedUuids.toLocaleString()}</div>
                    </div>
                    <div className='bg-green-50 p-4 rounded-lg border border-green-100'>
                        <div className='text-sm text-green-600'>New Cards</div>
                        <div className='text-2xl font-bold'>{report.newCards.toLocaleString()}</div>
                    </div>
                    <div className='bg-purple-50 p-4 rounded-lg border border-purple-100'>
                        <div className='text-sm text-purple-600'>Total Updates Needed</div>
                        <div className='text-2xl font-bold'>{report.totalUpdatesNeeded.toLocaleString()}</div>
                    </div>
                </div>
                <div className='text-sm text-gray-500'>
                    <div>Generated on: {new Date(report.timestamp).toLocaleString()}</div>
                    <div>Processing time: {report.processingTimeSeconds} seconds</div>
                </div>
            </div>

            {report.changedUuids > 0 && (
                <div className='mb-8'>
                    <h2 className='text-xl font-semibold mb-4'>Changed UUIDs ({report.changedUuids.toLocaleString()})</h2>
                    <div className='overflow-x-auto'>
                        <table className='min-w-full bg-white border border-gray-200'>
                            <thead>
                                <tr className='bg-gray-100'>
                                    <th className='px-4 py-2 text-left'>Name</th>
                                    <th className='px-4 py-2 text-left'>Set Code</th>
                                    <th className='px-4 py-2 text-left'>Number</th>
                                    <th className='px-4 py-2 text-left'>Old UUID</th>
                                    <th className='px-4 py-2 text-left'>New UUID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.details.changedCards.map((card, index) => (
                                    <tr key={card.uuid} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                        <td className='px-4 py-2 border-b'>{card.name}</td>
                                        <td className='px-4 py-2 border-b'>{card.setCode}</td>
                                        <td className='px-4 py-2 border-b'>{card.number}</td>
                                        <td className='px-4 py-2 border-b font-mono text-xs'>{card.oldUuid}</td>
                                        <td className='px-4 py-2 border-b font-mono text-xs'>{card.uuid}</td>
                                    </tr>
                                ))}
                                {report.changedUuids > report.details.changedCards.length && (
                                    <tr>
                                        <td colSpan={5} className='px-4 py-2 text-center text-gray-500 italic'>
                                            ...and {report.changedUuids - report.details.changedCards.length} more
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {report.newCards > 0 && (
                <div className='mb-8'>
                    <h2 className='text-xl font-semibold mb-4'>New Cards ({report.newCards.toLocaleString()})</h2>
                    <div className='overflow-x-auto'>
                        <table className='min-w-full bg-white border border-gray-200'>
                            <thead>
                                <tr className='bg-gray-100'>
                                    <th className='px-4 py-2 text-left'>Name</th>
                                    <th className='px-4 py-2 text-left'>Set Code</th>
                                    <th className='px-4 py-2 text-left'>Number</th>
                                    <th className='px-4 py-2 text-left'>UUID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {report.details.newCards.map((card, index) => (
                                    <tr key={card.uuid} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                                        <td className='px-4 py-2 border-b'>{card.name}</td>
                                        <td className='px-4 py-2 border-b'>{card.setCode}</td>
                                        <td className='px-4 py-2 border-b'>{card.number}</td>
                                        <td className='px-4 py-2 border-b font-mono text-xs'>{card.uuid}</td>
                                    </tr>
                                ))}
                                {report.newCards > report.details.newCards.length && (
                                    <tr>
                                        <td colSpan={4} className='px-4 py-2 text-center text-gray-500 italic'>
                                            ...and {report.newCards - report.details.newCards.length} more
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {report.changedUuids === 0 && report.newCards === 0 && (
                <div className='bg-green-50 p-6 rounded-lg border border-green-200 text-center'>
                    <h2 className='text-xl font-semibold mb-2 text-green-600'>All Cards Up To Date!</h2>
                    <p className='text-green-700'>No image updates are needed at this time.</p>
                </div>
            )}
        </div>
    );
}
