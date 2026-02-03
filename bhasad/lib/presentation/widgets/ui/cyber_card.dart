import 'dart:ui';
import 'package:bhasad/core/models/room_model.dart';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:lucide_flutter/lucide_flutter.dart';
import 'dart:async';

class CyberCard extends StatefulWidget {
  final RoomModel room;
  final double distanceInKm;
  final String status;

  const CyberCard({
    super.key,
    required this.room,
    required this.distanceInKm,
    required this.status,
  });

  @override
  State<CyberCard> createState() => _CyberCardState();
}

class _CyberCardState extends State<CyberCard> {
  late Timer _timer;
  Duration? _timeRemaining;

  @override
  void initState() {
    super.initState();
    _updateRemainingTime();
    _timer = Timer.periodic(const Duration(seconds: 1), (_) => _updateRemainingTime());
  }

  void _updateRemainingTime() {
    final now = DateTime.now();
    final expiresAt = widget.room.expiresAt.toDate();
    if (now.isBefore(expiresAt)) {
      if (mounted) setState(() => _timeRemaining = expiresAt.difference(now));
    } else {
      if (mounted) setState(() => _timeRemaining = Duration.zero);
      _timer.cancel();
    }
  }

  @override
  void dispose() {
    _timer.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => context.go('/arena', extra: widget.room),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(16.0),
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 5.0, sigmaY: 5.0),
          child: Container(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.grey.shade900.withOpacity(0.5),
              borderRadius: BorderRadius.circular(16.0),
              border: Border.all(color: Colors.white.withOpacity(0.2)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        const Icon(LucideIcons.shield, size: 20),
                        const SizedBox(width: 8),
                        Text(
                          widget.room.topic.toUpperCase(),
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 1.5),
                        ),
                      ],
                    ),
                    Text(
                      widget.status.toUpperCase(),
                      style: const TextStyle(color: Colors.blueAccent, letterSpacing: 1.5),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                if (_timeRemaining != null)
                  Text(
                    'T-MINUS ${_formatDuration(_timeRemaining!)}',
                    style: const TextStyle(color: Colors.white70, letterSpacing: 1.5),
                  ),
                const SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    ElevatedButton.icon(
                      onPressed: () { /* TODO: Implement Wipe */ },
                      icon: const Icon(LucideIcons.trash2, size: 16),
                      label: const Text('WIPE'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.grey.shade800,
                        foregroundColor: Colors.white,
                      ),
                    )
                  ],
                )
              ],
            ),
          ),
        ),
      ),
    );
  }

  String _formatDuration(Duration duration) {
    String twoDigits(int n) => n.toString().padLeft(2, '0');
    final hours = twoDigits(duration.inHours);
    final minutes = twoDigits(duration.inMinutes.remainder(60));
    final seconds = twoDigits(duration.inSeconds.remainder(60));
    return "$hours:$minutes:$seconds";
  }
}
