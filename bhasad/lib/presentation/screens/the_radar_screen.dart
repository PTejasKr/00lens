import 'package:bhasad/core/models/room_model.dart';
import 'package:bhasad/core/services/firestore_service.dart';
import 'package:bhasad/presentation/widgets/ui/cyber_card.dart';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:go_router/go_router.dart';
import 'package:intl/intl.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import 'dart:async';

class TheRadarScreen extends StatefulWidget {
  const TheRadarScreen({super.key});

  @override
  State<TheRadarScreen> createState() => _TheRadarScreenState();
}

class _TheRadarScreenState extends State<TheRadarScreen> {
  final FirestoreService _firestoreService = FirestoreService();
  Position? _currentPosition;
  bool _isLoading = true;
  String _errorMessage = '';
  late Timer _timer;
  late String _timeString;
  late String _dateString;

  @override
  void initState() {
    super.initState();
    _timeString = _formatDateTime(DateTime.now(), 'HH:mm');
    _dateString = _formatDateTime(DateTime.now(), 'EEEE, MMM d').toUpperCase();
    _timer = Timer.periodic(const Duration(seconds: 1), (Timer t) => _getTime());
    _determinePosition();
  }

  void _getTime() {
    final DateTime now = DateTime.now();
    final String formattedTime = _formatDateTime(now, 'HH:mm');
    final String formattedDate = _formatDateTime(now, 'EEEE, MMM d').toUpperCase();
    setState(() {
      _timeString = formattedTime;
      _dateString = formattedDate;
    });
  }

  String _formatDateTime(DateTime dateTime, String format) {
    return DateFormat(format).format(dateTime);
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  Future<void> _determinePosition() async {
    // ... (rest of the location logic is unchanged)
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        leading: IconButton(icon: const Icon(LucideIcons.menu), onPressed: () {}),
        title: const Text('BHASAD_SECURE_COMMS',
            style: TextStyle(fontSize: 16, letterSpacing: 2)),
        centerTitle: true,
        actions: [
          IconButton(icon: const Icon(LucideIcons.shield), onPressed: () {}),
        ],
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
      body: _buildBody(),
    );
  }

  Widget _buildBody() {
    return Column(
      children: [
        _buildClockSection(),
        _buildSignalsHeader(),
        Expanded(child: _buildRoomsList()),
        _buildFooter(),
      ],
    );
  }

  Widget _buildClockSection() {
    return Padding(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        children: [
          Text(_timeString, style: const TextStyle(fontSize: 72, fontWeight: FontWeight.w200)),
          Text(_dateString, style: const TextStyle(letterSpacing: 1.5)),
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                width: 8,
                height: 8,
                decoration: const BoxDecoration(
                  color: Colors.blueAccent,
                  shape: BoxShape.circle,
                ),
              ),
              const SizedBox(width: 8),
              const Text('ENCRYPTION_LAYER: ACTIVE', style: TextStyle(color: Colors.blueAccent, letterSpacing: 1.5)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildSignalsHeader() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text('PENDING_SIGNALS', style: TextStyle(color: Colors.white70, letterSpacing: 1.5)),
          Text('[03_NEW]', style: TextStyle(color: Theme.of(context).primaryColor, letterSpacing: 1.5)),
        ],
      ),
    );
  }

  Widget _buildRoomsList() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }
    // ... (rest of the room list logic is unchanged, but we will update the card)
    return StreamBuilder<List<RoomModel>>(
      stream: _firestoreService.getRooms(),
      builder: (context, snapshot) {
        // ... (error/loading handling)

        final rooms = snapshot.data!;
        // ... (filtering logic)

        return ListView.builder(
          itemCount: rooms.length,
          itemBuilder: (context, index) {
            final room = rooms[index];
            final distanceInKm = _currentPosition != null ? Geolocator.distanceBetween(
                  _currentPosition!.latitude,
                  _currentPosition!.longitude,
                  room.location.latitude,
                  room.location.longitude,
                ) / 1000 : 0.0;
            // We will now pass new info to CyberCard
            return CyberCard(room: room, distanceInKm: distanceInKm, status: "ENCRYPTED");
          },
        );
      },
    );
  }

  Widget _buildFooter() {
    return const Padding(
      padding: EdgeInsets.all(16.0),
      child: Column(
        children: [
          Divider(color: Colors.white24),
          SizedBox(height: 8),
          Text('SECURE TERMINAL V4.0.2', style: TextStyle(color: Colors.white38, letterSpacing: 2)),
        ],
      ),
    );
  }
}
