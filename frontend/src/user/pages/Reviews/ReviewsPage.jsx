// src/user/pages/Reviews/ReviewsPage.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Star, MessageSquare, Package } from 'lucide-react';
import api from '../../../services/api';
import { getImageUrl } from '../../../utils/getImageUrl';

function StarDisplay({ rating }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((s) => (
                <Star
                    key={s}
                    className={`w-4 h-4 ${s <= rating ? 'text-yellow-400 fill-current' : 'text-gray-600'}`}
                />
            ))}
        </div>
    );
}

export default function ReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        api.get('/client/mis-resenas')
            .then(({ data }) => setReviews(data))
            .catch(() => setError('No se pudieron cargar tus reseñas.'))
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="bg-gray-900/80 border border-gray-800 rounded-2xl shadow-xl p-8">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                        <MessageSquare className="w-5 h-5 text-yellow-400" />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-white">Mis Reseñas</h1>
                        <p className="text-xs text-gray-500">Tus opiniones sobre productos comprados</p>
                    </div>
                </div>
                <p className="text-gray-400 text-sm">Cargando reseñas...</p>
            </div>
        );
    }

    return (
        <div className="bg-gray-900/80 border border-gray-800 rounded-2xl shadow-xl p-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-yellow-400" />
                </div>
                <div>
                    <h1 className="text-xl font-bold text-white">Mis Reseñas</h1>
                    <p className="text-xs text-gray-500">Tus opiniones sobre productos comprados</p>
                </div>
            </div>

            {error && (
                <p className="text-red-400 text-sm mb-4">{error}</p>
            )}

            {reviews.length === 0 && !error ? (
                <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-sm">Aún no has dejado ninguna reseña.</p>
                    <p className="text-gray-500 text-xs mt-1">
                        Puedes reseñar productos una vez que hayas recibido tu pedido.
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <div
                            key={review.id}
                            className="bg-gray-800/60 border border-gray-700 rounded-xl p-5 flex gap-4"
                        >
                            {/* Imagen del producto */}
                            <Link to={`/producto/${review.producto_id}`} className="shrink-0">
                                <img
                                    src={getImageUrl(review.producto_imagen)}
                                    alt={review.producto_titulo}
                                    className="w-16 h-16 rounded-lg object-cover bg-gray-700"
                                    onError={(e) => { e.target.src = '/placeholder.svg'; }}
                                />
                            </Link>

                            {/* Contenido */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 mb-1">
                                    <Link
                                        to={`/producto/${review.producto_id}`}
                                        className="text-sm font-semibold text-white hover:text-sky-400 transition-colors truncate"
                                    >
                                        {review.producto_titulo}
                                    </Link>
                                    <span className="text-xs text-gray-500 shrink-0">
                                        {new Date(review.created_at).toLocaleDateString('es-CL')}
                                    </span>
                                </div>

                                <StarDisplay rating={review.calificacion} />

                                {review.comentario && (
                                    <p className="text-gray-400 text-sm mt-2 leading-relaxed">
                                        {review.comentario}
                                    </p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
