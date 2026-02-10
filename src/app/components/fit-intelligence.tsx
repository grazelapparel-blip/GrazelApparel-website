import { useState } from 'react';
import { ArrowLeft, Check, Upload, X } from 'lucide-react';
import { useAppStore } from '../store/app-store';

interface FitIntelligenceProps {
  onClose: () => void;
  onComplete: (recommendedSize: string) => void;
}

type Step = 'intro' | 'measurements' | 'body-type' | 'preference' | 'photos' | 'result';

export function FitIntelligence({ onClose, onComplete }: FitIntelligenceProps) {
  const { addFitProfile, currentUser } = useAppStore();
  const [currentStep, setCurrentStep] = useState<Step>('intro');
  const [recommendedSize, setRecommendedSize] = useState<string>('M');
  const [fitConfidence, setFitConfidence] = useState<number>(0);
  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    chest: '',
    waist: '',
    hips: '',
    bodyType: '',
    fitPreference: '',
    photosUploaded: 0
  });

  const bodyTypes = [
    { id: 'athletic', label: 'Athletic', description: 'Broad shoulders, defined waist' },
    { id: 'regular', label: 'Regular', description: 'Balanced proportions' },
    { id: 'relaxed', label: 'Relaxed', description: 'Comfortable, natural build' }
  ];

  const fitPreferences = [
    { id: 'slim', label: 'Slim Fit', description: 'Close to body, modern silhouette' },
    { id: 'regular', label: 'Regular Fit', description: 'Classic, comfortable fit' },
    { id: 'relaxed', label: 'Relaxed Fit', description: 'Generous room, easy wear' }
  ];

  // Size recommendation algorithm based on measurements
  const calculateRecommendedSize = (height: number, chest: number, fitPref: string) => {
    let size = 'M'; // Default
    let confidence = 70;

    // Use chest and height for size calculation
    if (chest && height) {
      if (chest < 88) {
        size = 'XS';
        confidence = 85;
      } else if (chest < 94) {
        size = 'S';
        confidence = 88;
      } else if (chest < 100) {
        size = 'M';
        confidence = 90;
      } else if (chest < 106) {
        size = 'L';
        confidence = 88;
      } else if (chest < 112) {
        size = 'XL';
        confidence = 85;
      } else {
        size = 'XXL';
        confidence = 82;
      }

      // Adjust for fit preference
      if (fitPref === 'slim') {
        // Slim fit might suggest size down in some cases
        confidence += 5;
      } else if (fitPref === 'relaxed') {
        confidence += 3;
      }
    } else if (height) {
      // If only height is available
      if (height < 160) {
        size = 'XS';
      } else if (height < 170) {
        size = 'S';
      } else if (height < 180) {
        size = 'M';
      } else if (height < 190) {
        size = 'L';
      } else {
        size = 'XL';
      }
      confidence = 65;
    }

    return { size, confidence: Math.min(confidence, 95) };
  };

  const goToNextStep = () => {
    const steps: Step[] = ['intro', 'measurements', 'body-type', 'preference', 'photos', 'result'];
    const currentIndex = steps.indexOf(currentStep);

    if (currentStep === 'preference') {
      // Calculate recommended size before moving to result
      const height = Number(formData.height);
      const chest = Number(formData.chest);
      const { size, confidence } = calculateRecommendedSize(height, chest, formData.fitPreference);
      setRecommendedSize(size);
      setFitConfidence(confidence);
    }

    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  const goToPreviousStep = () => {
    const steps: Step[] = ['intro', 'measurements', 'body-type', 'preference', 'photos', 'result'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  const handleCompleteProfile = async () => {
    if (currentUser) {
      try {
        await addFitProfile({
          height: formData.height,
          weight: formData.weight,
          chest: formData.chest,
          waist: formData.waist,
          hips: formData.hips,
          preferredFit: formData.fitPreference as 'slim' | 'regular' | 'relaxed',
          preferredSize: recommendedSize,
          notes: `Body type: ${formData.bodyType}`
        });
      } catch (error) {
        console.error('Failed to save fit profile:', error);
      }
    }
    onComplete(recommendedSize);
  };

  const renderProgressBar = () => {
    const steps = ['measurements', 'body-type', 'preference', 'photos', 'result'];
    const currentIndex = steps.indexOf(currentStep);
    const progress = currentStep === 'intro' ? 0 : ((currentIndex + 1) / steps.length) * 100;

    return (
      <div className="h-1 bg-[var(--muted)] mb-8">
        <div
          className="h-full bg-[var(--crimson)] transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[var(--cream)] py-12">
      <div className="max-w-3xl mx-auto px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          {currentStep !== 'intro' && currentStep !== 'result' && (
            <button
              onClick={goToPreviousStep}
              className="flex items-center gap-2 text-[14px] text-[var(--charcoal)] hover:text-[var(--crimson)] transition-colors"
            >
              <ArrowLeft size={18} strokeWidth={1.5} />
              Back
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-auto text-[var(--charcoal)] hover:text-[var(--crimson)] transition-colors"
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>

        {renderProgressBar()}

        {/* Intro Step */}
        {currentStep === 'intro' && (
          <div className="bg-white p-12 text-center">
            <h1 className="font-[var(--font-serif)] text-4xl mb-6 text-[var(--charcoal)]">
              Personal Fit Profile
            </h1>
            <p className="text-[15px] text-[var(--charcoal)] leading-relaxed mb-8 max-w-2xl mx-auto">
              Create your personal fit profile to receive tailored size recommendations and see how garments will look on your body. This process takes approximately 3 minutes.
            </p>
            <div className="space-y-4 text-left max-w-md mx-auto mb-8">
              <div className="flex gap-3">
                <Check size={20} className="text-[var(--crimson)] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <p className="text-[14px] text-[var(--charcoal)]">
                  Accurate size recommendations based on your measurements
                </p>
              </div>
              <div className="flex gap-3">
                <Check size={20} className="text-[var(--crimson)] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <p className="text-[14px] text-[var(--charcoal)]">
                  Virtual fit preview using AI technology
                </p>
              </div>
              <div className="flex gap-3">
                <Check size={20} className="text-[var(--crimson)] flex-shrink-0 mt-0.5" strokeWidth={1.5} />
                <p className="text-[14px] text-[var(--charcoal)]">
                  Reduced returns and increased satisfaction
                </p>
              </div>
            </div>
            <button
              onClick={goToNextStep}
              className="h-14 px-12 bg-[var(--crimson)] text-white text-[14px] tracking-wide hover:opacity-90 transition-opacity"
            >
              Get Started
            </button>
            <p className="text-[12px] text-[var(--light-gray)] mt-6">
              Your data is securely stored and never shared with third parties.
            </p>
          </div>
        )}

        {/* Measurements Step */}
        {currentStep === 'measurements' && (
          <div className="bg-white p-12">
            <h2 className="font-[var(--font-serif)] text-3xl mb-4 text-[var(--charcoal)]">
              Your Measurements
            </h2>
            <p className="text-[14px] text-[var(--light-gray)] mb-8">
              Enter your measurements for accurate fit recommendations. All measurements in centimeters.
            </p>
            <div className="space-y-6 mb-8">
              <div>
                <label className="block text-[14px] text-[var(--charcoal)] mb-2">
                  Height (cm) <span className="text-[var(--crimson)]">*</span>
                </label>
                <input
                  type="number"
                  value={formData.height}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  placeholder="175"
                  className="w-full h-12 px-4 border border-[var(--border)] text-[14px] focus:outline-none focus:ring-1 focus:ring-[var(--crimson)]"
                />
              </div>
              <div>
                <label className="block text-[14px] text-[var(--charcoal)] mb-2">
                  Weight (kg) <span className="text-[var(--light-gray)]">(Optional)</span>
                </label>
                <input
                  type="number"
                  value={formData.weight}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  placeholder="70"
                  className="w-full h-12 px-4 border border-[var(--border)] text-[14px] focus:outline-none focus:ring-1 focus:ring-[var(--crimson)]"
                />
              </div>
              <div>
                <label className="block text-[14px] text-[var(--charcoal)] mb-2">
                  Chest (cm) <span className="text-[var(--light-gray)]">(Optional)</span>
                </label>
                <input
                  type="number"
                  value={formData.chest}
                  onChange={(e) => setFormData({ ...formData, chest: e.target.value })}
                  placeholder="98"
                  className="w-full h-12 px-4 border border-[var(--border)] text-[14px] focus:outline-none focus:ring-1 focus:ring-[var(--crimson)]"
                />
              </div>
              <div>
                <label className="block text-[14px] text-[var(--charcoal)] mb-2">
                  Waist (cm) <span className="text-[var(--light-gray)]">(Optional)</span>
                </label>
                <input
                  type="number"
                  value={formData.waist}
                  onChange={(e) => setFormData({ ...formData, waist: e.target.value })}
                  placeholder="84"
                  className="w-full h-12 px-4 border border-[var(--border)] text-[14px] focus:outline-none focus:ring-1 focus:ring-[var(--crimson)]"
                />
              </div>
              <div>
                <label className="block text-[14px] text-[var(--charcoal)] mb-2">
                  Hips (cm) <span className="text-[var(--light-gray)]">(Optional)</span>
                </label>
                <input
                  type="number"
                  value={formData.hips}
                  onChange={(e) => setFormData({ ...formData, hips: e.target.value })}
                  placeholder="98"
                  className="w-full h-12 px-4 border border-[var(--border)] text-[14px] focus:outline-none focus:ring-1 focus:ring-[var(--crimson)]"
                />
              </div>
            </div>
            <button
              onClick={goToNextStep}
              disabled={!formData.height}
              className="w-full h-12 bg-[var(--crimson)] text-white text-[14px] tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        )}

        {/* Body Type Step */}
        {currentStep === 'body-type' && (
          <div className="bg-white p-12">
            <h2 className="font-[var(--font-serif)] text-3xl mb-4 text-[var(--charcoal)]">
              Body Type
            </h2>
            <p className="text-[14px] text-[var(--light-gray)] mb-8">
              Select the body type that best describes your build.
            </p>
            <div className="space-y-3 mb-8">
              {bodyTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setFormData({ ...formData, bodyType: type.id })}
                  className={`w-full p-6 border text-left transition-all ${
                    formData.bodyType === type.id
                      ? 'border-[var(--crimson)] bg-[var(--cream)]'
                      : 'border-[var(--border)] hover:border-[var(--crimson)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[16px] text-[var(--charcoal)]">{type.label}</h3>
                    {formData.bodyType === type.id && (
                      <Check size={20} className="text-[var(--crimson)]" strokeWidth={2} />
                    )}
                  </div>
                  <p className="text-[13px] text-[var(--light-gray)]">{type.description}</p>
                </button>
              ))}
            </div>
            <button
              onClick={goToNextStep}
              disabled={!formData.bodyType}
              className="w-full h-12 bg-[var(--crimson)] text-white text-[14px] tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        )}

        {/* Fit Preference Step */}
        {currentStep === 'preference' && (
          <div className="bg-white p-12">
            <h2 className="font-[var(--font-serif)] text-3xl mb-4 text-[var(--charcoal)]">
              Fit Preference
            </h2>
            <p className="text-[14px] text-[var(--light-gray)] mb-8">
              How do you prefer your garments to fit?
            </p>
            <div className="space-y-3 mb-8">
              {fitPreferences.map((pref) => (
                <button
                  key={pref.id}
                  onClick={() => setFormData({ ...formData, fitPreference: pref.id })}
                  className={`w-full p-6 border text-left transition-all ${
                    formData.fitPreference === pref.id
                      ? 'border-[var(--crimson)] bg-[var(--cream)]'
                      : 'border-[var(--border)] hover:border-[var(--crimson)]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-[16px] text-[var(--charcoal)]">{pref.label}</h3>
                    {formData.fitPreference === pref.id && (
                      <Check size={20} className="text-[var(--crimson)]" strokeWidth={2} />
                    )}
                  </div>
                  <p className="text-[13px] text-[var(--light-gray)]">{pref.description}</p>
                </button>
              ))}
            </div>
            <button
              onClick={goToNextStep}
              disabled={!formData.fitPreference}
              className="w-full h-12 bg-[var(--crimson)] text-white text-[14px] tracking-wide hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue
            </button>
          </div>
        )}

        {/* Photos Step */}
        {currentStep === 'photos' && (
          <div className="bg-white p-12">
            <h2 className="font-[var(--font-serif)] text-3xl mb-4 text-[var(--charcoal)]">
              Virtual Fit Preview
            </h2>
            <p className="text-[14px] text-[var(--light-gray)] mb-8">
              Upload photos for AI-powered fit visualization (optional).
            </p>
            <div className="border-2 border-dashed border-[var(--border)] p-12 text-center mb-6">
              <Upload size={48} className="mx-auto mb-4 text-[var(--light-gray)]" strokeWidth={1.5} />
              <p className="text-[14px] text-[var(--charcoal)] mb-2">
                Upload 4 photos (front, side, back, neutral pose)
              </p>
              <p className="text-[12px] text-[var(--light-gray)] mb-4">
                Plain background, fitted clothing, face optional
              </p>
              <input type="file" multiple accept="image/*" className="hidden" id="photo-upload" />
              <label
                htmlFor="photo-upload"
                className="inline-block px-8 h-10 border border-[var(--crimson)] text-[var(--crimson)] text-[13px] tracking-wide hover:bg-[var(--crimson)] hover:text-white transition-all cursor-pointer leading-10"
              >
                Select Photos
              </label>
            </div>
            <div className="bg-[var(--cream)] p-4 mb-8">
              <div className="flex items-start gap-3">
                <Check size={16} className="text-[var(--crimson)] flex-shrink-0 mt-0.5" strokeWidth={2} />
                <div className="text-[12px] text-[var(--charcoal)]">
                  <p className="mb-1">Your photos are processed securely and encrypted.</p>
                  <p>You can skip this step and still receive size recommendations.</p>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setFormData({ ...formData, photosUploaded: 0 });
                  goToNextStep();
                }}
                className="flex-1 h-12 border border-[var(--border)] text-[var(--charcoal)] text-[14px] tracking-wide hover:border-[var(--crimson)] transition-colors"
              >
                Skip This Step
              </button>
              <button
                onClick={goToNextStep}
                className="flex-1 h-12 bg-[var(--crimson)] text-white text-[14px] tracking-wide hover:opacity-90 transition-opacity"
              >
                Generate Preview
              </button>
            </div>
          </div>
        )}

        {/* Result Step */}
        {currentStep === 'result' && (
          <div className="bg-white p-12">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[var(--crimson)] rounded-full flex items-center justify-center mx-auto mb-4">
                <Check size={32} className="text-white" strokeWidth={2} />
              </div>
              <h2 className="font-[var(--font-serif)] text-3xl mb-4 text-[var(--charcoal)]">
                Your Profile is Ready
              </h2>
              <p className="text-[14px] text-[var(--light-gray)]">
                Based on your measurements and preferences, we recommend:
              </p>
            </div>

            <div className="bg-[var(--cream)] p-8 mb-8">
              <div className="text-center mb-6">
                <p className="text-[13px] text-[var(--light-gray)] mb-2">Recommended Size</p>
                <p className="font-[var(--font-serif)] text-5xl text-[var(--crimson)]">{recommendedSize}</p>
              </div>
              <div className="space-y-3 text-[14px] text-[var(--charcoal)]">
                <div className="flex justify-between py-3 border-t border-[var(--border)]">
                  <span>Fit Confidence</span>
                  <span className="text-[var(--crimson)]">{fitConfidence}%</span>
                </div>
                {formData.height && (
                  <div className="flex justify-between py-3 border-t border-[var(--border)]">
                    <span>Height</span>
                    <span>{formData.height} cm</span>
                  </div>
                )}
                {formData.chest && (
                  <div className="flex justify-between py-3 border-t border-[var(--border)]">
                    <span>Chest</span>
                    <span>{formData.chest} cm</span>
                  </div>
                )}
                {formData.fitPreference && (
                  <div className="flex justify-between py-3 border-t border-b border-[var(--border)]">
                    <span>Fit Preference</span>
                    <span className="capitalize">{formData.fitPreference.replace('-', ' ')} Fit</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 mb-8 rounded">
              <p className="text-[13px] text-blue-900">
                ✓ This profile has been saved to your account. You can update your measurements anytime to get new size recommendations.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleCompleteProfile}
                className="w-full h-12 bg-[var(--crimson)] text-white text-[14px] tracking-wide hover:opacity-90 transition-opacity"
              >
                Add to Cart - Size {recommendedSize}
              </button>
              <button
                onClick={onClose}
                className="w-full h-12 border border-[var(--border)] text-[var(--charcoal)] text-[14px] tracking-wide hover:border-[var(--crimson)] transition-colors"
              >
                Back to Product
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
