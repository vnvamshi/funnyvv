import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

import img1 from '../../assets/images/v3.2/popular-cities/1.png';
import img2 from '../../assets/images/v3.2/popular-cities/2.png';
import img3 from '../../assets/images/v3.2/popular-cities/3.png';
import img4 from '../../assets/images/v3.2/popular-cities/4.png';
import img5 from '../../assets/images/v3.2/popular-cities/5.png';
import img6 from '../../assets/images/v3.2/popular-cities/6.png';

const cities = [
	{ id: 1, name: 'New York', image: img1 },
	{ id: 2, name: 'London', image: img2 },
	{ id: 3, name: 'Paris', image: img3 },
	{ id: 4, name: 'Dubai', image: img4 },
	{ id: 5, name: 'Sydney', image: img5 },
	{ id: 6, name: 'Singapore', image: img6 }
];

const PopularCitiesCarousel: React.FC = () => {
	const headingStyle: React.CSSProperties = {
		backgroundImage: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 25.82%, #905E26 100%)',
		WebkitBackgroundClip: 'text',
		WebkitTextFillColor: 'transparent',
		backgroundClip: 'text',
		color: 'transparent'
	};

	return (
		<section className="w-full">
			<div className="max-w-[1720px] mx-auto px-10 md:px-20 py-10 md:py-14">
				<div className="flex justify-center">
					<h2 className="text-2xl md:text-4xl font-semibold" style={headingStyle}>
						Popular Cities
					</h2>
				</div>
				<div className="mt-8 md:mt-10">
					<Swiper
						slidesPerView={5}
						spaceBetween={18}
						grabCursor={true}
						breakpoints={{
							0: { slidesPerView: 1.2, spaceBetween: 12 },
							480: { slidesPerView: 1.6, spaceBetween: 14 },
							640: { slidesPerView: 2.2, spaceBetween: 16 },
							768: { slidesPerView: 3.2, spaceBetween: 18 },
							1024: { slidesPerView: 5, spaceBetween: 18 },
							1280: { slidesPerView: 5, spaceBetween: 20 },
							1536: { slidesPerView: 5, spaceBetween: 22 }
						}}
					>
						{cities.map((c) => (
							<SwiperSlide key={c.id}>
								<div className="flex flex-col">
									<div className="rounded-2xl overflow-hidden border border-white/10 bg-black/10">
										<img
											src={c.image}
											alt={c.name}
											className="w-full h-[240px] md:h-[300px] object-cover"
										/>
									</div>
									<p className="mt-4 text-[18px] md:text-[20px] font-semibold text-[#004236]">{c.name}</p>
								</div>
							</SwiperSlide>
						))}
					</Swiper>
				</div>
			</div>
		</section>
	);
};

export default PopularCitiesCarousel; 