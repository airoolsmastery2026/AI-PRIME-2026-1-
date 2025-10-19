import React from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ZAxis, ReferenceLine, Label } from 'recharts';
import { DualIncomeNiche } from '../types';
import { useTranslation } from '../i18n/useTranslation';

interface NicheScatterPlotProps {
    data: DualIncomeNiche[];
}

const NicheCustomTooltip = ({ active, payload }: any) => {
    const { t } = useTranslation();
    if (active && payload && payload.length) {
        const data: DualIncomeNiche = payload[0].payload;
        return (
            <div className="bg-gray-800/80 backdrop-blur-sm p-3 border border-gray-600 rounded-md text-sm w-64">
                <p className="font-bold text-cyan-300 mb-2">{data.niche}</p>
                <p className="text-gray-300">{data.reasoning}</p>
                <div className="mt-2 pt-2 border-t border-gray-600">
                    <p className="text-purple-300">{`${t('dualIncomeHunter.viralPotential')}: ${data.viralPotential.toFixed(1)}/10`}</p>
                    <p className="text-green-400">{`${t('dualIncomeHunter.affiliatePotential')}: ${data.affiliatePotential.toFixed(1)}/10`}</p>
                </div>
            </div>
        );
    }
    return null;
};

export const NicheScatterPlot: React.FC<NicheScatterPlotProps> = ({ data }) => {
    const { t } = useTranslation();

    return (
        <div className="w-full h-96">
            <ResponsiveContainer width="100%" height="100%">
                <ScatterChart
                    margin={{
                        top: 20,
                        right: 20,
                        bottom: 40, // Increased bottom margin for labels
                        left: 20,
                    }}
                >
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    
                    <XAxis type="number" dataKey="viralPotential" name={t('dualIncomeHunter.viralPotential')} domain={[0, 10]} stroke="#9ca3af">
                        <Label value={t('dualIncomeHunter.viralPotential')} offset={-25} position="insideBottom" fill="#9ca3af" />
                    </XAxis>

                    <YAxis type="number" dataKey="affiliatePotential" name={t('dualIncomeHunter.affiliatePotential')} domain={[0, 10]} stroke="#9ca3af">
                         <Label value={t('dualIncomeHunter.affiliatePotential')} angle={-90} offset={0} position="insideLeft" fill="#9ca3af" style={{ textAnchor: 'middle' }}/>
                    </YAxis>

                    <ZAxis dataKey="niche" name="niche" />
                    
                    <Tooltip content={<NicheCustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />

                    <ReferenceLine x={5} stroke="#6b7280" strokeDasharray="4 4" />
                    <ReferenceLine y={5} stroke="#6b7280" strokeDasharray="4 4" />
                    
                    <Scatter name="Niches" data={data} fill="#8b5cf6">
                        {/* No need for <Cell /> here unless we want to color each point differently */}
                    </Scatter>

                </ScatterChart>
            </ResponsiveContainer>
        </div>
    );
};