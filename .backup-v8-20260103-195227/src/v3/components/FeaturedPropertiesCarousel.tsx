import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';

import skyvenImg from '../../assets/images/v3.2/skyven.png';
import img1 from '../../assets/images/v3.2/fp-samples/1.png';
import img2 from '../../assets/images/v3.2/fp-samples/2.png';
import img3 from '../../assets/images/v3.2/fp-samples/3.png';
import img4 from '../../assets/images/v3.2/fp-samples/4.png';
import img5 from '../../assets/images/v3.2/fp-samples/5.png';
import img6 from '../../assets/images/v3.2/fp-samples/6.png';
import vrIcon from '../../assets/images/v3.2/vr-tour-icon.png';
import overlayPng from '../../assets/images/v3.2/feature-style-gradient.png';
import FeaturedPropertiesHeading from './FeaturedPropertiesHeading';
import { VR_TOUR_URL } from '../../utils/vrTourUrl';

const SKYVEN_VIEWER_ROUTE = '/skyven-with-surroundings-viewer';

const FeaturedPropertiesCarousel: React.FC = () => {
	const navigate = useNavigate();

	const properties = [
		{ id: 'skyven', title: 'Skyven Residences', image: skyvenImg, viewerRoute: SKYVEN_VIEWER_ROUTE },
		{ id: 1, title: 'AVA Maple Properties', image: img1, vrUrl: VR_TOUR_URL },
		{ id: 2, title: 'CCI Rivali Park Stargaze', image: img2, vrUrl: VR_TOUR_URL },
		{ id: 3, title: 'Pratham By Shraddha', image: img3, vrUrl: VR_TOUR_URL },
		{ id: 4, title: 'Shraddha Park City', image: img4, vrUrl: VR_TOUR_URL },
		{ id: 5, title: 'CCI Rivali Park Moonrise', image: img5, vrUrl: VR_TOUR_URL },
		{ id: 6, title: 'BlueHorizon Heights', image: img6, vrUrl: VR_TOUR_URL }
	];

	return (
		<section className="w-full">
			<div className="max-w-[1720px] mx-auto px-10 md:px-20 py-10 md:py-14">
				<div className="flex justify-center">
					<FeaturedPropertiesHeading className="text-2xl md:text-4xl font-semibold" />
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
						{properties.map((p) => (
							<SwiperSlide key={p.id}>
								<div
									className="rounded-2xl overflow-hidden relative group border border-white/10 bg-black/20 cursor-pointer"
									onClick={() => {
										if (p.viewerRoute) {
											navigate(p.viewerRoute);
											return;
										}
										if (p.vrUrl) {
											window.open(p.vrUrl, '_blank', 'noopener,noreferrer');
										}
									}}
								>
									<img src={p.image} alt={p.title} className="w-full h-[240px] md:h-[300px] object-cover" />
									{/* overlay image above */}
									<div
										className="absolute inset-0"
										style={{ backgroundImage: `url(${overlayPng})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
									/>
									{/* bottom content */}
									<div className="absolute left-0 right-0 bottom-0 p-4 md:p-5 flex flex-col items-start justify-end gap-2">
										<p className="text-white text-sm md:text-base font-medium opacity-95">{p.title}</p>
										<div
											className="rounded-md p-[1.5px]"
											style={{ background: 'linear-gradient(90deg, #905E26 0%, #F5EC9B 50%, #905E26 100%)' }}
										>
											<button
												className="flex items-center gap-2 text-[12px] md:text-[13px] text-white px-3 py-1.5 rounded-[6px] hover:opacity-95 transition"
												type="button"
												style={{ background: 'linear-gradient(111.83deg, #004236 11.73%, #007E67 96.61%)' }}
												onClick={() => {
													if (p.viewerRoute) {
														navigate(p.viewerRoute);
														return;
													}
													if (p.vrUrl) {
														window.open(p.vrUrl, '_blank', 'noopener,noreferrer');
													}
												}}
											>
												<img src={vrIcon} alt="VR" className="w-4 h-4" />
												<span>VR Tour</span>
											</button>
										</div>
									</div>
								</div>
							</SwiperSlide>
						))}
					</Swiper>
				</div>
			</div>
		</section>
	);
};

export default FeaturedPropertiesCarousel; 