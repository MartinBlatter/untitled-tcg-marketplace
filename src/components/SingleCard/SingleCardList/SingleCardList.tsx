import { CardSet } from '@/src/types/AllMTGJSONTypes';
import { buildProductLink } from '@/src/utils/helpers';
import { LinearProgress, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import CardImageTooltip from '../../CardImageTooltip/CardImageTooltip';
import ImageWithFallback from '../../ImageWithFallback/ImageWithFallback';
import { SingleCardListProps } from './types';

const SingleCardList = ({ cards, loading = true, sortBy = 'name', sortOrder = 'asc', setSortBy }: SingleCardListProps) => {
    const t = useTranslations();

    return (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table sx={{ minWidth: 650 }} aria-label='simple table' component={'div'}>
                <TableHead component={'div'}>
                    <TableRow
                        sx={{
                            backgroundColor: 'primary.main',
                            color: 'primary.contrastText',
                            span: { color: 'primary.contrastText' },
                        }}
                        component={'div'}
                    >
                        <TableCell component={'span'} sx={{ width: '5px', minWidth: '5px' }} />
                        <TableCell component={'span'} onClick={() => setSortBy('name')} sx={{ cursor: 'pointer' }}>
                            {t('products.singleCard.name')} {(sortBy as unknown as string) === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                        </TableCell>
                        <TableCell component={'span'} align='center' onClick={() => setSortBy('setCode')} sx={{ cursor: 'pointer' }}>
                            {t('products.singleCard.set')} {(sortBy as unknown as string) === 'setCode' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                        </TableCell>
                        <TableCell component={'span'} align='center' onClick={() => setSortBy('number')} sx={{ cursor: 'pointer' }}>
                            {t('products.singleCard.number')} {(sortBy as unknown as string) === 'number' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                        </TableCell>
                        <TableCell component={'span'} align='center' onClick={() => setSortBy('rarity')} sx={{ cursor: 'pointer' }}>
                            {t('products.singleCard.rarity')} {(sortBy as unknown as string) === 'rarity' ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
                        </TableCell>
                        <TableCell component={'span'} align='center'>
                            {t('products.singleCard.price')}
                        </TableCell>
                    </TableRow>
                </TableHead>
                <TableBody component={'div'}>
                    {loading ? (
                        <TableRow component={'div'}>
                            <TableCell align='center' component={'div'}></TableCell>
                            <TableCell align='center' component={'div'}>
                                <LinearProgress />
                            </TableCell>
                            <TableCell align='center' component={'div'}>
                                <LinearProgress />
                            </TableCell>
                            <TableCell align='center' component={'div'}>
                                <LinearProgress />
                            </TableCell>
                            <TableCell align='center' component={'div'}>
                                <LinearProgress />
                            </TableCell>
                            <TableCell align='center' component={'div'}>
                                <LinearProgress />
                            </TableCell>
                        </TableRow>
                    ) : null}
                    {!loading && cards && cards.length === 0 ? (
                        <TableRow>
                            <TableCell align='center' colSpan={6}>
                                {t('appBar.searchField.noResults')}
                            </TableCell>
                        </TableRow>
                    ) : null}
                    {!loading && cards && cards.length > 0
                        ? cards.map((card) => (
                              <TableRow
                                  sx={{
                                      cursor: 'pointer',
                                      '&:nth-of-type(odd)': {
                                          backgroundColor: 'action.hover',
                                      },
                                      '&:last-child td, &:last-child th': { border: 0 },
                                  }}
                                  key={card.id}
                                  href={buildProductLink('magic', card.setCode, 'singles', card.name, card.uuid)}
                                  component={'a'}
                              >
                                  <TableCell align='center' scope='row' sx={{ width: '5px', minWidth: '5px' }} component={'span'}>
                                      <CardImageTooltip card={card as unknown as CardSet} />
                                  </TableCell>
                                  <TableCell align='left' component={'span'}>
                                      {card.name}
                                      <Typography variant='caption' gutterBottom sx={{ display: 'block' }}>
                                          {card.foreignName}
                                      </Typography>
                                  </TableCell>
                                  <TableCell align='center' component={'span'}>
                                      <ImageWithFallback
                                          height={20}
                                          width={20}
                                          className='invertFilter'
                                          src={`/images/magic/editions/${card.setCode.toLowerCase()}.svg`}
                                          fallbackSrc={`/images/magic/editions/fallback.svg`}
                                          alt={card.setCode}
                                      />
                                  </TableCell>
                                  <TableCell align='center' component={'span'}>
                                      {card.number}
                                  </TableCell>
                                  <TableCell align='center' component={'span'}>
                                      <span className={`magic-rarity ${card.rarity}`} />
                                  </TableCell>
                                  <TableCell align='center' component={'span'}>
                                      {card.price}
                                  </TableCell>
                              </TableRow>
                          ))
                        : null}
                </TableBody>
            </Table>
        </TableContainer>
    );
};

export default SingleCardList;
