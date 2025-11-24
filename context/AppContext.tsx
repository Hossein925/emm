
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import type { Section, Disease, FileAttachment, Banner } from '../types';
import { FileType } from '../types';
import { api } from '../lib/api';

interface AppContextType {
  isAdmin: boolean;
  isLoading: boolean;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  sections: Section[];
  banners: Banner[];
  addBanner: (file: File, title: string, description: string) => Promise<void>;
  updateBanner: (bannerId: string, title: string, description: string, imageFile: File | null) => Promise<void>;
  deleteBanner: (bannerId: string) => Promise<void>;
  updateSection: (sectionId: string, newName: string, newIcon: string, newColorClass: string) => Promise<void>;
  updateDisease: (sectionId: string, diseaseId: string, newName: string, newDescription: string) => Promise<void>;
  addFileToDisease: (sectionId: string, diseaseId: string, file: File, name: string, description: string) => Promise<void>;
  addSection: (name: string, icon: string, colorClass: string) => Promise<void>;
  deleteSection: (sectionId: string) => Promise<void>;
  addDisease: (sectionId: string, name: string, description: string) => Promise<void>;
  deleteDisease: (sectionId: string, diseaseId: string) => Promise<void>;
  deleteFile: (sectionId: string, diseaseId: string, fileId: string) => Promise<void>;
  aboutHospitalTopics: Disease[];
  addAboutHospitalTopic: (name: string, description: string) => Promise<void>;
  updateAboutHospitalTopic: (topicId: string, newName: string, newDescription: string) => Promise<void>;
  deleteAboutHospitalTopic: (topicId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LoadingSpinner: React.FC = () => (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-sky-100 to-violet-200">
      <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-b-4 border-sky-500"></div>
    </div>
);


export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [sections, setSections] = useState<Section[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [aboutHospitalTopics, setAboutHospitalTopics] = useState<Disease[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async () => {
    try {
      // 1. Load Banners
      const bannersData = await api.getBanners();
      const bannersWithUrls = bannersData.map((banner: any) => ({
          ...banner,
          id: banner.id.toString(),
          imageUrl: api.getFileUrl(banner.image_path),
      }));
      setBanners(bannersWithUrls);
      
      // 2. Load Sections
      const sectionsData = await api.getSections();

      // 3. Load Diseases
      const diseasesData = await api.getDiseases();

      // 4. Load Files
      const filesData = await api.getFiles();

      // Process Files
      const filesByDiseaseId = filesData.reduce((acc: any, file: any) => {
          const diseaseId = file.disease_id.toString();
          if (!acc[diseaseId]) acc[diseaseId] = [];
          
          acc[diseaseId].push({
              id: file.id.toString(),
              name: file.name,
              description: file.description,
              type: file.file_type as FileType,
              dataUrl: api.getFileUrl(file.file_path),
          });
          return acc;
      }, {} as { [key: string]: FileAttachment[] });

      // Process Diseases
      const diseasesBySectionId = diseasesData.reduce((acc: any, disease: any) => {
          const sectionId = disease.section_id.toString();
          if (!acc[sectionId]) acc[sectionId] = [];
          acc[sectionId].push({
              id: disease.id.toString(),
              name: disease.name,
              description: disease.description,
              files: filesByDiseaseId[disease.id.toString()] || [],
          });
          return acc;
      }, {} as { [key: string]: Disease[] });

      // Process Sections
      const populatedSections = sectionsData.map((section: any) => ({
          id: section.id.toString(),
          name: section.name,
          icon: section.icon,
          colorClass: section.color_class,
          diseases: diseasesBySectionId[section.id.toString()] || [],
      }));

      setSections(populatedSections);

      // 5. Load Topics
      const topicsData = await api.getTopics();
      const topics: Disease[] = topicsData.map((topic: any) => ({
        id: topic.id.toString(),
        name: topic.name,
        description: topic.description,
        files: [],
      }));
      setAboutHospitalTopics(topics);

    } catch (error) {
      console.error("Failed to load app data:", error);
      // Don't alert constantly in dev if server is down, just log
    }
  };

  useEffect(() => {
    setIsLoading(true);
    loadData().finally(() => setIsLoading(false));
  }, []);

  const login = (user: string, pass: string): boolean => {
    if (user === '5850008985' && pass === '64546') {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
  };

  const addBanner = async (file: File, title: string, description: string) => {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('description', description);

      try {
        await api.addBanner(formData);
        await loadData();
      } catch (error: any) {
        console.error('Error uploading banner:', error);
        alert('خطا در بارگذاری بنر: ' + error.message);
      }
  };

  const updateBanner = async (bannerId: string, title: string, description: string, imageFile: File | null) => {
    const formData = new FormData();
    formData.append('title', title);
    formData.append('description', description);
    if (imageFile) {
        formData.append('file', imageFile);
    }

    try {
        await api.updateBanner(bannerId, formData);
        await loadData();
    } catch (error: any) {
        console.error('Error updating banner:', error);
        alert('خطا در به‌روزرسانی بنر: ' + error.message);
    }
  };

  const deleteBanner = async (bannerId: string) => {
      try {
          await api.deleteBanner(bannerId);
          await loadData();
      } catch (error: any) {
          console.error('Error deleting banner:', error);
          alert('خطا در حذف بنر: ' + error.message);
      }
  };

  const addSection = async (name: string, icon: string, colorClass: string) => {
    try {
        await api.addSection({ name, icon, color_class: colorClass });
        await loadData();
    } catch (error: any) {
        console.error('Error adding section:', error);
        alert('خطا در افزودن بخش: ' + error.message);
    }
  };

  const deleteSection = async (sectionId: string) => {
    if (window.confirm('آیا از حذف این بخش و تمام بیماری‌های آن اطمینان دارید؟')) {
        try {
            await api.deleteSection(sectionId);
            await loadData();
        } catch (error: any) {
            console.error('Error deleting section:', error);
            alert('خطا در حذف بخش: ' + error.message);
        }
    }
  };

  const addDisease = async (sectionId: string, name: string, description: string) => {
    try {
        await api.addDisease({ name, description, section_id: parseInt(sectionId) });
        await loadData();
    } catch (error: any) {
        console.error('Error adding disease:', error);
        alert('خطا در افزودن بیماری: ' + error.message);
    }
  };

  const deleteDisease = async (sectionId: string, diseaseId: string) => {
    if (window.confirm('آیا از حذف این بیماری اطمینان دارید؟')) {
        try {
            await api.deleteDisease(diseaseId);
            await loadData();
        } catch (error: any) {
            console.error('Error deleting disease:', error);
            alert('خطا در حذف بیماری: ' + error.message);
        }
    }
  };
  
  const deleteFile = async (sectionId: string, diseaseId: string, fileId: string) => {
    if (window.confirm('آیا از حذف این فایل اطمینان دارید؟')) {
        try {
            await api.deleteFile(fileId);
            await loadData();
        } catch (error: any) {
            console.error('Error deleting file:', error);
            alert('خطا در حذف فایل: ' + error.message);
        }
    }
  };

  const updateSection = async (sectionId: string, newName: string, newIcon: string, newColorClass: string) => {
    try {
        await api.updateSection(sectionId, { name: newName, icon: newIcon, color_class: newColorClass });
        await loadData();
    } catch (error: any) {
        console.error('Error updating section:', error);
        alert('خطا در به‌روزرسانی بخش: ' + error.message);
    }
  };
  
  const updateDisease = async (sectionId: string, diseaseId: string, newName: string, newDescription: string) => {
    try {
        await api.updateDisease(diseaseId, { name: newName, description: newDescription });
        await loadData();
    } catch (error: any) {
        console.error('Error updating disease:', error);
        alert('خطا در به‌روزرسانی بیماری: ' + error.message);
    }
  };

  const addFileToDisease = async (sectionId: string, diseaseId: string, file: File, name: string, description: string) => {
    const getFileType = (inputFile: File): FileType => {
        if (inputFile.type.startsWith('image/')) return FileType.IMAGE;
        if (inputFile.type === 'application/pdf') return FileType.PDF;
        if (inputFile.type.startsWith('audio/')) return FileType.AUDIO;
        return FileType.UNKNOWN;
    };
    
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('description', description);
    formData.append('disease_id', diseaseId);
    formData.append('file_type', getFileType(file));

    try {
        await api.addFile(formData);
        await loadData();
    } catch (error: any) {
        console.error('Error uploading file:', error);
        alert('خطا در بارگذاری فایل: ' + error.message);
    }
  };

  const addAboutHospitalTopic = async (name: string, description: string) => {
    try {
        await api.addTopic({ name, description });
        await loadData();
    } catch (error: any) {
        console.error('Error adding topic:', error);
        alert('خطا در افزودن موضوع: ' + error.message);
    }
  };

  const updateAboutHospitalTopic = async (topicId: string, newName: string, newDescription: string) => {
      try {
          await api.updateTopic(topicId, { name: newName, description: newDescription });
          await loadData();
      } catch (error: any) {
          console.error('Error updating topic:', error);
          alert('خطا در به‌روزرسانی موضوع: ' + error.message);
      }
  };

  const deleteAboutHospitalTopic = async (topicId: string) => {
      if (window.confirm('آیا از حذف این موضوع اطمینان دارید؟')) {
        try {
            await api.deleteTopic(topicId);
            await loadData();
        } catch (error: any) {
            console.error('Error deleting topic:', error);
            alert('خطا در حذف موضوع: ' + error.message);
        }
      }
  };

  return (
    <AppContext.Provider value={{ 
        isAdmin,
        isLoading,
        login, 
        logout, 
        sections, 
        banners,
        addBanner,
        updateBanner,
        deleteBanner,
        updateSection,
        updateDisease,
        addFileToDisease,
        addSection,
        deleteSection,
        addDisease,
        deleteDisease,
        deleteFile,
        aboutHospitalTopics,
        addAboutHospitalTopic,
        updateAboutHospitalTopic,
        deleteAboutHospitalTopic,
    }}>
      {isLoading ? <LoadingSpinner /> : children}
    </AppContext.Provider>
  );
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};
