import { magicSetCodeToNameMapping } from '@/src/lib/mappings/magicSetCodeToNameMapping';
import { buildProductLink } from '@/src/utils/helpers';
import { Card, CardActionArea, CardContent, FormControl, Grid, InputLabel, LinearProgress, MenuItem, Select, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import SingleCardImage from '../SingleCardImage/SingleCardImage';
import { SingleCardTilesProps } from './types';

const SingleCardTiles = ({ cards, loading = false, setSortBy, sortBy = 'name', sortOrder = 'asc' }: SingleCardTilesProps) => {
    const t = useTranslations();

    return (
        <>
            <FormControl size='small' sx={{ minWidth: 200, mt: 2 }}>
                <InputLabel id='select-sort-by-label'>{t('table.sortBy')}</InputLabel>
                <Select labelId='select-sort-by-label' id='select-sort-by' value={sortBy} label={t('table.sortBy')} onChange={(e) => setSortBy(e.target.value)}>
                    <MenuItem value='name'>{t('inventory.inventoryColumns.name')}</MenuItem>
                    <MenuItem value='setCode'>{t('inventory.inventoryColumns.set')}</MenuItem>
                    <MenuItem value='number'>{t('inventory.inventoryColumns.number')}</MenuItem>
                    <MenuItem value='rarity'>{t('inventory.inventoryColumns.rarity')}</MenuItem>
                </Select>
            </FormControl>
            <FormControl size='small' sx={{ minWidth: 200, mt: 2, ml: 2 }}>
                <InputLabel id='select-sort-order-label'>{t('table.sortOrder')}</InputLabel>
                <Select labelId='select-sort-order-label' id='select-sort-order' value={sortOrder} label={t('table.sortOrder')} onChange={(e) => setSortBy(sortBy)}>
                    <MenuItem value='asc'>{t('table.ascending')}</MenuItem>
                    <MenuItem value='desc'>{t('table.descending')}</MenuItem>
                </Select>
            </FormControl>
            <Grid container spacing={4} sx={{ mt: 2, justifyContent: 'left' }}>
                {loading && (
                    <>
                        {(() => {
                            const loadingCards = [];

                            for (let i = 0; i <= 3; i++) {
                                loadingCards.push(
                                    <Card key={`loader-card-${i}`} sx={{ width: '264px', height: '520px' }}>
                                        <CardContent>
                                            <LinearProgress />
                                        </CardContent>
                                    </Card>
                                );
                            }

                            return loadingCards;
                        })()}
                    </>
                )}
                {!loading && cards && cards.length === 0 ? <Typography variant='h6'>{t('appBar.searchField.noResults')}</Typography> : null}
                {!loading && cards && cards.length > 0
                    ? cards.map((card) => (
                          <Card key={card.id} sx={{ width: '264px', cursor: 'pointer' }} component={'a'} href={buildProductLink('magic', card.setCode, 'singles', card.name, card.uuid)}>
                              <CardActionArea>
                                  <SingleCardImage card={card} showOverlay={false} />
                                  <CardContent>
                                      <Typography variant='h6'>{card.name}</Typography>
                                      <Typography
                                          color='textSecondary'
                                          gutterBottom
                                          sx={{
                                              fontWeight: 'bold',
                                              display: 'block'
                                          }}>
                                          {card.foreignName}
                                      </Typography>
                                      <Typography color='textSecondary'>
                                          {t('products.singleCard.set')}: {magicSetCodeToNameMapping[card.setCode as keyof typeof magicSetCodeToNameMapping]}
                                      </Typography>
                                      <Typography color='textSecondary'>
                                          {t('products.singleCard.rarity')}: <span className={`capitalize`}>{card.rarity}</span>
                                      </Typography>
                                      <Typography color='textSecondary'>
                                          {t('products.singleCard.price')}: ${card.price}
                                      </Typography>
                                  </CardContent>
                              </CardActionArea>
                          </Card>
                      ))
                    : null}
            </Grid>
        </>
    );
};

export default SingleCardTiles;
