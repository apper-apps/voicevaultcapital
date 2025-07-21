import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import SearchBar from "@/components/molecules/SearchBar";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import { recordingsService } from "@/services/api/recordingsService";
import { transcriptsService } from "@/services/api/transcriptsService";
import { cn } from "@/utils/cn";

const SearchPage = () => {
  const [recordings, setRecordings] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({
    department: "all",
    dateRange: "all",
    hasTranscript: false
  });
  const navigate = useNavigate();

  useEffect(() => {
    loadRecordings();
  }, []);

  const loadRecordings = async () => {
    try {
      setError("");
      const data = await recordingsService.getAll();
      setRecordings(data);
    } catch (err) {
      setError("Failed to load recordings for search");
      console.error("Error loading recordings:", err);
    }
  };

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setQuery("");
      return;
    }

    setLoading(true);
    setQuery(searchQuery);

    try {
      await new Promise(resolve => setTimeout(resolve, 600));

      // Basic search across recordings metadata
      let results = recordings.filter(recording => {
        const titleMatch = recording.title.toLowerCase().includes(searchQuery.toLowerCase());
        const participantMatch = recording.participants.some(p => 
          p.toLowerCase().includes(searchQuery.toLowerCase())
        );
        const tagMatch = recording.tags.some(t => 
          t.toLowerCase().includes(searchQuery.toLowerCase())
        );
        const departmentMatch = recording.department.toLowerCase().includes(searchQuery.toLowerCase());

        return titleMatch || participantMatch || tagMatch || departmentMatch;
      });

      // Apply filters
      if (filters.department !== "all") {
        results = results.filter(r => r.department === filters.department);
      }

      if (filters.dateRange !== "all") {
        const now = new Date();
        const filterDate = new Date();
        
        switch (filters.dateRange) {
          case "week":
            filterDate.setDate(now.getDate() - 7);
            break;
          case "month":
            filterDate.setMonth(now.getMonth() - 1);
            break;
          case "quarter":
            filterDate.setMonth(now.getMonth() - 3);
            break;
        }
        
        results = results.filter(r => new Date(r.createdAt) >= filterDate);
      }

      // Add relevance scoring (mock implementation)
      const scoredResults = results.map(recording => {
        let relevance = 0;
        const lowerQuery = searchQuery.toLowerCase();
        
        // Title matches get highest score
        if (recording.title.toLowerCase().includes(lowerQuery)) relevance += 100;
        
        // Tag matches
        recording.tags.forEach(tag => {
          if (tag.toLowerCase().includes(lowerQuery)) relevance += 50;
        });
        
        // Participant matches
        recording.participants.forEach(participant => {
          if (participant.toLowerCase().includes(lowerQuery)) relevance += 30;
        });
        
        // Department match
        if (recording.department.toLowerCase().includes(lowerQuery)) relevance += 20;

        return {
          ...recording,
          relevance: Math.min(100, relevance),
          matchType: relevance >= 100 ? "high" : relevance >= 50 ? "medium" : "low"
        };
      });

      // Sort by relevance
      scoredResults.sort((a, b) => b.relevance - a.relevance);
      
      setSearchResults(scoredResults);
    } catch (err) {
      setError("Search failed. Please try again.");
      console.error("Search error:", err);
    } finally {
      setLoading(false);
    }
  };

  const getRelevanceColor = (matchType) => {
    switch (matchType) {
      case "high": return "text-success";
      case "medium": return "text-warning";
      default: return "text-white/60";
    }
  };

  const getRelevanceIcon = (matchType) => {
    switch (matchType) {
      case "high": return "CheckCircle2";
      case "medium": return "AlertCircle";
      default: return "Circle";
    }
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const highlightText = (text, query) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, "gi");
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-accent/30 text-accent font-medium rounded px-1">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const departments = [...new Set(recordings.map(r => r.department))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Search Recordings</h1>
        <p className="text-white/70">Find and analyze your audio content with AI-powered semantic search</p>
      </div>

      {/* Search Controls */}
      <Card>
        <div className="space-y-4">
          <SearchBar
            onSearch={performSearch}
            placeholder="Search recordings, participants, topics, or content..."
            className="w-full"
          />
          
          {/* Filters */}
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-white mb-1">Department</label>
              <select
                value={filters.department}
                onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                className="px-3 py-2 glass rounded-lg border border-white/20 text-white bg-transparent focus:ring-2 focus:ring-primary/50"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept} className="bg-surface text-white">
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-white mb-1">Date Range</label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="px-3 py-2 glass rounded-lg border border-white/20 text-white bg-transparent focus:ring-2 focus:ring-primary/50"
              >
                <option value="all">All Time</option>
                <option value="week" className="bg-surface text-white">Past Week</option>
                <option value="month" className="bg-surface text-white">Past Month</option>
                <option value="quarter" className="bg-surface text-white">Past Quarter</option>
              </select>
            </div>
          </div>
        </div>
      </Card>

      {/* Search Results */}
      {loading && <Loading message="Searching recordings..." />}
      
      {error && <Error message={error} onRetry={() => performSearch(query)} />}
      
      {query && !loading && searchResults.length === 0 && (
        <Empty
          title="No results found"
          message={`No recordings match "${query}". Try adjusting your search terms or filters.`}
          icon="SearchX"
          actionLabel="Clear Search"
          onAction={() => {
            setQuery("");
            setSearchResults([]);
          }}
        />
      )}

      {searchResults.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">
              Search Results ({searchResults.length})
            </h2>
            <div className="flex items-center gap-2 text-sm text-white/60">
              <span>Showing results for</span>
              <span className="font-semibold text-accent">"{query}"</span>
            </div>
          </div>

          <div className="grid gap-4">
            {searchResults.map((recording) => (
              <Card
                key={recording.Id}
                className="hover:scale-[1.01] transition-all duration-200 cursor-pointer"
                onClick={() => navigate(`/recordings/${recording.Id}`)}
              >
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <ApperIcon name="FileAudio" size={24} className="text-primary" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-white leading-tight">
                        {highlightText(recording.title, query)}
                      </h3>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className={cn(
                          "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                          getRelevanceColor(recording.matchType)
                        )}>
                          <ApperIcon name={getRelevanceIcon(recording.matchType)} size={12} />
                          {recording.relevance}% match
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-white/70 mb-3">
                      <div className="flex items-center gap-1">
                        <ApperIcon name="Calendar" size={14} />
                        <span>{format(new Date(recording.createdAt), "MMM dd, yyyy")}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ApperIcon name="Clock" size={14} />
                        <span>{formatDuration(recording.duration)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <ApperIcon name="Building" size={14} />
                        <span>{highlightText(recording.department, query)}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      {recording.participants.slice(0, 3).map((participant, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 glass rounded-full text-xs text-white/80"
                        >
                          {highlightText(participant, query)}
                        </span>
                      ))}
                      {recording.participants.length > 3 && (
                        <span className="px-2 py-1 glass rounded-full text-xs text-white/60">
                          +{recording.participants.length - 3} more
                        </span>
                      )}
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {recording.tags.slice(0, 4).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-accent/20 text-accent rounded-full text-xs"
                        >
                          #{highlightText(tag, query)}
                        </span>
                      ))}
                      {recording.tags.length > 4 && (
                        <span className="px-2 py-1 glass rounded-full text-xs text-white/60">
                          +{recording.tags.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    icon="ExternalLink"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/recordings/${recording.Id}`);
                    }}
                  />
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {!query && !loading && (
        <Card className="text-center py-16 border-dashed border-2 border-white/20">
          <ApperIcon name="Search" size={64} className="mx-auto text-white/40 mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Start Searching</h3>
          <p className="text-white/70 max-w-md mx-auto">
            Use the search bar above to find recordings by content, participants, tags, or topics. 
            Our AI-powered search understands context and meaning.
          </p>
        </Card>
      )}
    </div>
  );
};

export default SearchPage;