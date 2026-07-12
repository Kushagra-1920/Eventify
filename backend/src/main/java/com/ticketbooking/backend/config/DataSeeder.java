package com.ticketbooking.backend.config;

import com.ticketbooking.backend.entity.*;
import com.ticketbooking.backend.repository.*;
import net.datafaker.Faker;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;
import java.util.UUID;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final SeatRepository seatRepository;
    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;
    private final PasswordEncoder passwordEncoder;
    private final Faker faker = new Faker();
    private final Random random = new Random();

    @Value("${app.seed.enabled:false}")
    private boolean seedEnabled;

    @Value("${app.seed.events:8}")
    private int eventsCount;

    @Value("${app.seed.users:50}")
    private int usersCount;

    public DataSeeder(UserRepository userRepository, EventRepository eventRepository,
                      SeatRepository seatRepository, BookingRepository bookingRepository,
                      PaymentRepository paymentRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.eventRepository = eventRepository;
        this.seatRepository = seatRepository;
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (!seedEnabled || userRepository.count() > 0) {
            logger.info("Database seeding is disabled or database is not empty.");
            return;
        }

        logger.info("Starting database seeding...");
        
        List<User> demoUsers = seedUsers();
        List<Event> events = seedEvents();
        seedBookings(demoUsers, events);

        logger.info("Database seeding completed successfully!");
    }

    private List<User> seedUsers() {
        logger.info("Seeding users...");
        List<User> users = new ArrayList<>();

        User admin = User.builder()
                .name("Admin Kushagra")
                .email("kushagragoelv.2@gmail.com")
                .password(passwordEncoder.encode("Admin@123"))
                .role(Role.ADMIN)
                .build();
        users.add(userRepository.save(admin));

        String[] demoNames = {"John Doe", "Alice Smith", "Mike Johnson"};
        String[] demoEmails = {"john@example.com", "alice@example.com", "mike@example.com"};

        for (int i = 0; i < demoNames.length; i++) {
            User u = User.builder()
                    .name(demoNames[i])
                    .email(demoEmails[i])
                    .password(passwordEncoder.encode("User@123"))
                    .role(Role.USER)
                    .build();
            users.add(userRepository.save(u));
        }

        // Generate extra random users
        for (int i = 0; i < usersCount - 4; i++) {
            User u = User.builder()
                    .name(faker.name().fullName())
                    .email(faker.internet().emailAddress())
                    .password(passwordEncoder.encode("User@123"))
                    .role(Role.USER)
                    .build();
            users.add(userRepository.save(u));
        }

        return users;
    }

    private List<Event> seedEvents() {
        logger.info("Seeding events (10 per category)...");
        List<Event> events = new ArrayList<>();
        
        String[] musicVenues = {
            "NCPA: Tata Theatre, Nariman Point, Mumbai",
            "DY Patil Stadium, Nerul, Navi Mumbai",
            "Jawaharlal Nehru Stadium, Pragati Vihar, New Delhi",
            "Palace Grounds, Jayamahal, Bengaluru",
            "Ezone Club, Marathahalli, Bengaluru"
        };
        String[] sportsVenues = {
            "Narendra Modi Stadium, Motera, Ahmedabad",
            "Wankhede Stadium, Churchgate, Mumbai",
            "M. Chinnaswamy Stadium, Queens Road, Bengaluru",
            "Eden Gardens, Maidan, Kolkata",
            "Indira Gandhi Arena, Indraprastha Estate, New Delhi"
        };
        String[] comedyVenues = {
            "The Habitat, Khar West, Mumbai",
            "Canvas Comedy Club, Elphinstone Road, Mumbai",
            "The Comedy Club, Koramangala, Bengaluru",
            "Punchers Stand Up Club, Sector 29, Gurugram",
            "Club Comedy House, Connaught Place, New Delhi"
        };
        String[] techVenues = {
            "Jio World Convention Centre, Bandra Kurla Complex, Mumbai",
            "BIEC (Bangalore International Exhibition Centre), Madavara, Bengaluru",
            "Hyderabad International Convention Centre (HICC), Gachibowli, Hyderabad",
            "Pragati Maidan Exhibition Centre, New Delhi",
            "CIDCO Exhibition Centre, Vashi, Navi Mumbai"
        };
        String[] movieVenues = {
            "PVR Director's Cut, Ambience Mall, Gurugram",
            "IMAX, Jio World Drive, BKC, Mumbai",
            "Prasad's IMAX, NTR Gardens, Hyderabad",
            "Raj Mandir Cinema, Bhagwan Das Road, Jaipur",
            "Ariesplex SL Cinemas, Thampanoor, Thiruvananthapuram"
        };

        String[] movieTitles = {"Avengers: Endgame", "Dune: Part Two", "Oppenheimer", "Spider-Man: Across the Spider-Verse", "The Batman", "Interstellar", "Inception", "Avatar", "Joker", "The Dark Knight"};
        String[] movieImages = {
            "https://image.tmdb.org/t/p/w1280/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
            "https://image.tmdb.org/t/p/w1280/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
            "https://image.tmdb.org/t/p/w1280/fm6KqXpk3M2HVveHwCrBRoOoA0i.jpg",
            "https://image.tmdb.org/t/p/w1280/2u7zce8qqlRiGNZ5BDUAcpWz046.jpg",
            "https://image.tmdb.org/t/p/w1280/5P8SmMzSNYikXpzilOP1jMAuOys.jpg",
            "https://image.tmdb.org/t/p/w1280/pIu52Jb2L04WjA7hZ8W0F43Z872.jpg",
            "https://image.tmdb.org/t/p/w1280/zt8aQ6lsJ26z5zR3p6WjGMBu4W5.jpg",
            "https://image.tmdb.org/t/p/w1280/vL5LR6WdxWPjUU2E7cATt9q7Y2X.jpg",
            "https://image.tmdb.org/t/p/w1280/n6bUvigpRFqSwmIyHQOcx4dO5rP.jpg",
            "https://image.tmdb.org/t/p/w1280/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg"
        };

        String[] musicTitles = {"Coldplay: Music of the Spheres", "Taylor Swift: The Eras Tour", "Ed Sheeran: Mathematics Tour", "Arijit Singh Live", "The Weeknd: After Hours", "Dua Lipa: Future Nostalgia", "Bruno Mars: 24K Magic", "Imagine Dragons Live", "Billie Eilish: HTE Tour", "Metallica World Tour"};
        String[] musicImages = {
            "https://images.unsplash.com/photo-1470229722913-7c090be103f1?auto=format&fit=crop&w=1280&q=80",
            "https://images.unsplash.com/photo-1540039155733-d76e6c4849ec?auto=format&fit=crop&w=1280&q=80",
            "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1280&q=80",
            "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?auto=format&fit=crop&w=1280&q=80",
            "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1280&q=80",
            "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?auto=format&fit=crop&w=1280&q=80",
            "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1280&q=80",
            "https://images.unsplash.com/photo-1493225457124-a1a2a5f5f9af?auto=format&fit=crop&w=1280&q=80",
            "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1280&q=80",
            "https://images.unsplash.com/photo-1526478806334-5fd488fcaabc?auto=format&fit=crop&w=1280&q=80"
        };

        String[] sportsTitles = {"ICC World Cup Final", "IPL 2026 Finals", "Wimbledon Men's Final", "UEFA Champions League", "Pro Kabaddi League", "Formula 1 Grand Prix", "NBA Finals Game 7", "Olympic 100m Sprint", "Super Bowl LX", "Boxing Heavyweight Title"};
        String[] sportsImages = {
            "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1280&q=80",
            "https://images.unsplash.com/photo-1508344928928-7165b67de128?auto=format&fit=crop&w=1280&q=80",
            "https://images.unsplash.com/photo-1461896836934-2e2fc0b4dd12?auto=format&fit=crop&w=1280&q=80",
            "https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1280&q=80",
            "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1280&q=80",
            "https://images.unsplash.com/photo-1562016600-ece13e8ba570?auto=format&fit=crop&w=1280&q=80",
            "https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&w=1280&q=80",
            "https://images.unsplash.com/photo-1551266188-33ec813b3074?auto=format&fit=crop&w=1280&q=80",
            "https://images.unsplash.com/photo-1587280501635-68a0e82cd5ff?auto=format&fit=crop&w=1280&q=80",
            "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1280&q=80"
        };

        String[] comedyTitles = {"Zakir Khan Live", "Vir Das: Mind Fool", "Abhishek Upmanyu Live", "Trevor Noah: Off The Record", "Kevin Hart: Reality Check", "Dave Chappelle Live", "Ricky Gervais: Armageddon", "Anubhav Singh Bassi", "Russell Peters: Act Your Age", "Hasan Minhaj Live"};
        String[] comedyImages = {
            "https://images.unsplash.com/photo-1585699324551-f6c309eedeca?auto=format&fit=crop&w=1280&q=80",
            "https://images.unsplash.com/photo-1527224857830-43a7ebb8545e?auto=format&fit=crop&w=1280&q=80",
            "https://images.unsplash.com/photo-1627914225228-3e584f227b4c?auto=format&fit=crop&w=1280&q=80",
            "https://images.unsplash.com/photo-1516280440502-861f498c8c50?auto=format&fit=crop&w=1280&q=80",
            "https://images.unsplash.com/photo-1507676184212-d0c30a5957d0?auto=format&fit=crop&w=1280&q=80",
            "https://images.unsplash.com/photo-1558231908-16e6e232b509?auto=format&fit=crop&w=1280&q=80",
            "https://images.unsplash.com/photo-1605634563177-3844db31e33d?auto=format&fit=crop&w=1280&q=80",
            "https://images.unsplash.com/photo-1498845722476-eb36940da39b?auto=format&fit=crop&w=1280&q=80",
            "https://images.unsplash.com/photo-1563842147043-4dc97e55eb84?auto=format&fit=crop&w=1280&q=80",
            "https://images.unsplash.com/photo-1456942065839-44ff5877f060?auto=format&fit=crop&w=1280&q=80"
        };

        String[] techTitles = {"Google I/O 2026", "Apple WWDC", "AWS re:Invent", "React Conf 2026", "Web Summit India", "Microsoft Build", "DockerCon", "KubeCon + CloudNativeCon", "CES 2026", "Def Con 34"};
        String[] techImages = {
            "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1280&q=80",
            "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1280&q=80",
            "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1280&q=80",
            "https://images.unsplash.com/photo-1591115765373-5207764f72e7?auto=format&fit=crop&w=1280&q=80",
            "https://images.unsplash.com/photo-1550305080-400ce61e5927?auto=format&fit=crop&w=1280&q=80",
            "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=1280&q=80",
            "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1280&q=80",
            "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1280&q=80",
            "https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?auto=format&fit=crop&w=1280&q=80",
            "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=1280&q=80"
        };

        EventCategory[] categories = {EventCategory.MUSIC, EventCategory.SPORTS, EventCategory.COMEDY, EventCategory.TECHNOLOGY, EventCategory.MOVIE};
        
        for (EventCategory category : categories) {
            for (int i = 1; i <= 10; i++) {
                String title = "";
                String venue = "";
                String bannerUrl = "";
                int idx = (i - 1) % 5;
                int imageIdx = i - 1;

                switch (category) {
                    case MUSIC:
                        title = musicTitles[imageIdx];
                        venue = musicVenues[idx];
                        bannerUrl = musicImages[imageIdx];
                        break;
                    case SPORTS:
                        title = sportsTitles[imageIdx];
                        venue = sportsVenues[idx];
                        bannerUrl = sportsImages[imageIdx];
                        break;
                    case COMEDY:
                        title = comedyTitles[imageIdx];
                        venue = comedyVenues[idx];
                        bannerUrl = comedyImages[imageIdx];
                        break;
                    case TECHNOLOGY:
                        title = techTitles[imageIdx];
                        venue = techVenues[idx];
                        bannerUrl = techImages[imageIdx];
                        break;
                    case MOVIE:
                        title = movieTitles[imageIdx];
                        venue = movieVenues[idx];
                        bannerUrl = movieImages[imageIdx];
                        break;
                }

                Event event = Event.builder()
                        .title(title)
                        .description(faker.lorem().paragraph(3))
                        .venue(venue)
                        .dateTime(LocalDateTime.now().plusDays(random.nextInt(30) + 1).plusHours(random.nextInt(12)))
                        .category(category)
                        .bannerUrl(bannerUrl)
                        .status(EventStatus.UPCOMING)
                        .build();
                
                event = eventRepository.save(event);
                events.add(event);
                seedSeatsForEvent(event);
            }
        }
        return events;
    }

    private void seedSeatsForEvent(Event event) {
        List<Seat> seats = new ArrayList<>();
        
        // VIP: Rows A-D, 10 seats per row
        for (char row = 'A'; row <= 'D'; row++) {
            for (int i = 1; i <= 10; i++) {
                seats.add(createSeat(event, "VIP", String.valueOf(row), i, new BigDecimal("5000")));
            }
        }
        
        // Premium: Rows E-J, 15 seats per row
        for (char row = 'E'; row <= 'J'; row++) {
            for (int i = 1; i <= 15; i++) {
                seats.add(createSeat(event, "Premium", String.valueOf(row), i, new BigDecimal("2500")));
            }
        }

        // General: Rows K-T, 20 seats per row
        for (char row = 'K'; row <= 'T'; row++) {
            for (int i = 1; i <= 20; i++) {
                seats.add(createSeat(event, "General", String.valueOf(row), i, new BigDecimal("1200")));
            }
        }

        seatRepository.saveAll(seats);
    }
    
    private Seat createSeat(Event event, String section, String row, int number, BigDecimal price) {
        return Seat.builder()
                .event(event)
                .section(section)
                .row(row)
                .seatNumber(row + number)
                .price(price)
                .status(SeatStatus.AVAILABLE)
                .build();
    }

    private void seedBookings(List<User> users, List<Event> events) {
        logger.info("Seeding bookings...");
        // 50 Confirmed, 10 Cancelled, 5 Expired
        
        List<User> normalUsers = users.stream().filter(u -> u.getRole() == Role.USER).toList();

        // Confirmed
        for (int i = 0; i < 50; i++) {
            createRandomBooking(normalUsers, events, BookingStatus.CONFIRMED);
        }
        
        // Cancelled
        for (int i = 0; i < 10; i++) {
            createRandomBooking(normalUsers, events, BookingStatus.CANCELLED);
        }

        // Expired
        for (int i = 0; i < 5; i++) {
            createRandomBooking(normalUsers, events, BookingStatus.EXPIRED);
        }
        
        // Let's also leave a few seats as LOCKED for demo purposes
        for (int i = 0; i < 10; i++) {
            Event event = events.get(random.nextInt(events.size()));
            List<Seat> availableSeats = seatRepository.findByEventId(event.getId())
                .stream().filter(s -> s.getStatus() == SeatStatus.AVAILABLE).toList();
            if(!availableSeats.isEmpty()) {
                Seat seatToLock = availableSeats.get(0);
                seatToLock.setStatus(SeatStatus.LOCKED);
                seatToLock.setLockOwner(normalUsers.get(random.nextInt(normalUsers.size())).getId());
                seatToLock.setLockExpiryTime(LocalDateTime.now().plusMinutes(5));
                seatRepository.save(seatToLock);
            }
        }
    }
    
    private void createRandomBooking(List<User> users, List<Event> events, BookingStatus status) {
        User user = users.get(random.nextInt(users.size()));
        Event event = events.get(random.nextInt(events.size()));
        
        List<Seat> availableSeats = seatRepository.findByEventId(event.getId())
                .stream()
                .filter(s -> s.getStatus() == SeatStatus.AVAILABLE)
                .toList();
                
        if (availableSeats.size() < 3) return;
        
        int numSeats = random.nextInt(3) + 1; // 1 to 3 seats
        List<Seat> selectedSeats = new ArrayList<>();
        BigDecimal totalAmount = BigDecimal.ZERO;
        
        for (int i = 0; i < numSeats; i++) {
            Seat seat = availableSeats.get(i);
            selectedSeats.add(seat);
            totalAmount = totalAmount.add(seat.getPrice());
            
            if (status == BookingStatus.CONFIRMED) {
                seat.setStatus(SeatStatus.BOOKED);
            } else if (status == BookingStatus.CANCELLED) {
                // Was booked/locked then cancelled, seat is AVAILABLE
                seat.setStatus(SeatStatus.AVAILABLE);
            } else if (status == BookingStatus.EXPIRED) {
                // Was locked and expired, seat is AVAILABLE
                seat.setStatus(SeatStatus.AVAILABLE);
            }
        }
        
        seatRepository.saveAll(selectedSeats);
        
        Booking booking = Booking.builder()
                .user(user)
                .event(event)
                .seats(selectedSeats)
                .totalAmount(totalAmount)
                .bookingStatus(status)
                .createdAt(LocalDateTime.now().minusDays(random.nextInt(10)).minusHours(random.nextInt(24)))
                .build();
                
        bookingRepository.save(booking);
        
        if (status == BookingStatus.CONFIRMED) {
            Payment payment = Payment.builder()
                    .booking(booking)
                    .amount(totalAmount)
                    .transactionId("TXN_" + LocalDateTime.now().getYear() + "_" + UUID.randomUUID().toString().substring(0, 8).toUpperCase())
                    .paymentStatus(PaymentStatus.SUCCESS)
                    .createdAt(booking.getCreatedAt())
                    .build();
            paymentRepository.save(payment);
        }
    }
}
