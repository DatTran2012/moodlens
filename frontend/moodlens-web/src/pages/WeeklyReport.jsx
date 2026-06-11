// import { useEffect, useState } from "react";
// import api from "../api/axios";

// export default function WeeklyReport() {
//     const [data, setData] = useState(null);
//     const [loading, setLoading] = useState(true);

//     useEffect(() => {
//         fetchData();
//     }, []);

//     const fetchData = async () => {
//         try {
//             const res = await api.get("/ai/weekly-report");
//             setData(res.data);
//         } catch (err) {
//             console.log(err);
//         }
//         setLoading(false);
//     };

//     if (loading) {
//         return (
//             <div className="p-6 text-gray-400">
//                 Generating AI report...
//             </div>
//         );
//     }

//     return (
//         <div className="min-h-screen bg-gray-950 text-white p-4 sm:p-6">

//             {/* HEADER */}
//             <h1 className="text-2xl sm:text-3xl font-bold mb-2">
//                 🤖 AI Weekly Report
//             </h1>

//             <p className="text-gray-400 mb-6 text-sm">
//                 Your emotional summary powered by AI
//             </p>

//             {/* MAIN CARD */}
//             <div className="bg-white/5 border border-white/10 rounded-xl p-6">

//                 {/* SUMMARY */}
//                 <div className="mb-6">
//                     <h2 className="text-lg font-semibold mb-2">Summary</h2>
//                     <p className="text-gray-300 text-sm">
//                         {data.summary}
//                     </p>
//                 </div>

//                 {/* STATS */}
//                 <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">

//                     <div className="bg-blue-500/10 p-3 rounded-lg">
//                         <p className="text-xs text-gray-400">Trend</p>
//                         <p className="font-semibold capitalize">
//                             {data.trend}
//                         </p>
//                     </div>

//                     <div className="bg-green-500/10 p-3 rounded-lg">
//                         <p className="text-xs text-gray-400">Best Day</p>
//                         <p className="font-semibold">
//                             {data.bestDay}
//                         </p>
//                     </div>

//                     <div className="bg-red-500/10 p-3 rounded-lg">
//                         <p className="text-xs text-gray-400">Worst Day</p>
//                         <p className="font-semibold">
//                             {data.worstDay}
//                         </p>
//                     </div>

//                     <div className="bg-purple-500/10 p-3 rounded-lg">
//                         <p className="text-xs text-gray-400">Avg Score</p>
//                         <p className="font-semibold">
//                             {data.avgScore}
//                         </p>
//                     </div>

//                 </div>

//                 {/* RECOMMENDATIONS */}
//                 <div>
//                     <h2 className="text-lg font-semibold mb-3">
//                         AI Recommendations
//                     </h2>

//                     <ul className="space-y-2">
//                         {data.recommendations.map((item, index) => (
//                             <li
//                                 key={index}
//                                 className="bg-white/5 border border-white/10
//                            p-3 rounded-lg text-sm text-gray-300"
//                             >
//                                 💡 {item}
//                             </li>
//                         ))}
//                     </ul>
//                 </div>

//             </div>

//         </div>
//     );
// }